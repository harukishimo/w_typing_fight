-- Profiles table keeps customizable display names for authenticated users.
create table if not exists public.profiles (
  user_id uuid primary key references auth.users (id) on delete cascade,
  display_name text not null check (length(display_name) between 1 and 32),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists profiles_display_name_unique
  on public.profiles (lower(display_name));

create or replace function public.trigger_set_timestamp()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists set_timestamp_on_profiles on public.profiles;
create trigger set_timestamp_on_profiles
  before update on public.profiles
  for each row
  execute function public.trigger_set_timestamp();

alter table public.profiles enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'profiles' and policyname = 'profiles_public_read'
  ) then
    create policy profiles_public_read
      on public.profiles
      for select
      using (true);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'profiles' and policyname = 'profiles_self_write'
  ) then
    create policy profiles_self_write
      on public.profiles
      for insert
      with check (auth.uid() = user_id);

    create policy profiles_self_update
      on public.profiles
      for update
      using (auth.uid() = user_id)
      with check (auth.uid() = user_id);
  end if;
end $$;

-- Matches table stores results to derive win streaks.
create table if not exists public.matches (
  id uuid primary key default gen_random_uuid(),
  room_id text,
  winner_id uuid not null references auth.users (id),
  loser_id uuid not null references auth.users (id),
  winner_display_name text not null,
  loser_display_name text not null,
  ended_at timestamptz not null default now()
);

create index if not exists matches_winner_idx on public.matches (winner_id, ended_at desc);
create index if not exists matches_loser_idx on public.matches (loser_id, ended_at desc);

alter table public.matches enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'matches' and policyname = 'matches_service_insert'
  ) then
    create policy matches_service_insert
      on public.matches
      for insert
      with check (auth.role() = 'service_role');
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'matches' and policyname = 'matches_authenticated_select'
  ) then
    create policy matches_authenticated_select
      on public.matches
      for select
      using (auth.role() = 'authenticated' or auth.role() = 'service_role');
  end if;
end $$;

-- Streak table keeps rolling aggregates for quick leaderboard lookup.
create table if not exists public.user_streaks (
  user_id uuid primary key references auth.users (id) on delete cascade,
  current_streak integer not null default 0 check (current_streak >= 0),
  best_streak integer not null default 0 check (best_streak >= 0),
  updated_at timestamptz not null default now()
);

alter table public.user_streaks enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'user_streaks' and policyname = 'user_streaks_public_read'
  ) then
    create policy user_streaks_public_read
      on public.user_streaks
      for select
      using (true);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'user_streaks' and policyname = 'user_streaks_service_write'
  ) then
    create policy user_streaks_service_write
      on public.user_streaks
      for insert
      with check (auth.role() = 'service_role');

    create policy user_streaks_service_update
      on public.user_streaks
      for update
      using (auth.role() = 'service_role')
      with check (auth.role() = 'service_role');
  end if;
end $$;

drop trigger if exists set_timestamp_on_user_streaks on public.user_streaks;
create trigger set_timestamp_on_user_streaks
  before update on public.user_streaks
  for each row
  execute function public.trigger_set_timestamp();

-- Helper function to update win/loss streaks whenever a match is recorded.
create or replace function public.fn_update_streaks_after_match()
returns trigger as $$
declare
  new_winner_current integer;
begin
  -- Update winner streak
  insert into public.user_streaks as us (user_id, current_streak, best_streak)
  values (new.winner_id, 1, 1)
  on conflict (user_id) do update
    set current_streak = us.current_streak + 1,
        best_streak = greatest(us.best_streak, us.current_streak + 1),
        updated_at = now();

  -- Reset loser streak
  insert into public.user_streaks as ls (user_id, current_streak, best_streak)
  values (new.loser_id, 0, 0)
  on conflict (user_id) do update
    set current_streak = 0,
        updated_at = now();

  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists trg_update_streaks_after_match on public.matches;
create trigger trg_update_streaks_after_match
  after insert on public.matches
  for each row
  execute function public.fn_update_streaks_after_match();

-- Leaderboard view joins streaks with preferred display names.
create or replace view public.v_leaderboard_streaks as
select
  us.user_id,
  coalesce(p.display_name, au.raw_user_meta_data ->> 'full_name', au.email, 'Unknown') as display_name,
  us.current_streak,
  us.best_streak,
  us.updated_at
from public.user_streaks us
left join public.profiles p on p.user_id = us.user_id
left join auth.users au on au.id = us.user_id
order by us.best_streak desc, us.updated_at asc;
