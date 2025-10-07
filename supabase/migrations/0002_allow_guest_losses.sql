-- Allow logging matches when the opponent is not authenticated
alter table public.matches
  alter column loser_id drop not null;

create or replace function public.fn_update_streaks_after_match()
returns trigger as $$
begin
  -- Update winner streak
  insert into public.user_streaks as us (user_id, current_streak, best_streak)
  values (new.winner_id, 1, 1)
  on conflict (user_id) do update
    set current_streak = us.current_streak + 1,
        best_streak = greatest(us.best_streak, us.current_streak + 1),
        updated_at = now();

  -- Reset loser streak only when loser_id is present
  if new.loser_id is not null then
    insert into public.user_streaks as ls (user_id, current_streak, best_streak)
    values (new.loser_id, 0, 0)
    on conflict (user_id) do update
      set current_streak = 0,
          updated_at = now();
  end if;

  return new;
end;
$$ language plpgsql security definer;
