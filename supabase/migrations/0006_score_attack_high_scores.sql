-- Create score attack high score table and view
create table if not exists public.score_attack_high_scores (
  user_id uuid primary key,
  display_name text not null,
  best_score integer not null,
  updated_at timestamptz not null default now()
);

alter table public.score_attack_high_scores enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'score_attack_high_scores'
      and policyname = 'score_attack_high_scores_public_read'
  ) then
    create policy score_attack_high_scores_public_read
      on public.score_attack_high_scores
      for select
      using (true);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'score_attack_high_scores'
      and policyname = 'score_attack_high_scores_service_insert'
  ) then
    create policy score_attack_high_scores_service_insert
      on public.score_attack_high_scores
      for insert
      with check (auth.role() = 'service_role');
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'score_attack_high_scores'
      and policyname = 'score_attack_high_scores_user_insert'
  ) then
    create policy score_attack_high_scores_user_insert
      on public.score_attack_high_scores
      for insert
      with check (auth.uid() = user_id);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'score_attack_high_scores'
      and policyname = 'score_attack_high_scores_service_update'
  ) then
    create policy score_attack_high_scores_service_update
      on public.score_attack_high_scores
      for update
      using (auth.role() = 'service_role')
      with check (auth.role() = 'service_role');
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'score_attack_high_scores'
      and policyname = 'score_attack_high_scores_user_update'
  ) then
    create policy score_attack_high_scores_user_update
      on public.score_attack_high_scores
      for update
      using (auth.uid() = user_id)
      with check (auth.uid() = user_id);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'score_attack_high_scores'
      and policyname = 'score_attack_high_scores_service_delete'
  ) then
    create policy score_attack_high_scores_service_delete
      on public.score_attack_high_scores
      for delete
      using (auth.role() = 'service_role');
  end if;
end $$;

comment on table public.score_attack_high_scores is 'Tracks the best score attack result per user.';

create or replace view public.v_score_attack_high_scores as
  select
    user_id,
    display_name,
    best_score,
    updated_at
  from public.score_attack_high_scores
  order by best_score desc, updated_at asc;

comment on view public.v_score_attack_high_scores is 'Ordered view for score attack high score leaderboard.';
