-- Add authenticated role policies and grants for score attack high scores

do $$
begin
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
      and policyname = 'score_attack_high_scores_user_update'
  ) then
    create policy score_attack_high_scores_user_update
      on public.score_attack_high_scores
      for update
      using (auth.uid() = user_id)
      with check (auth.uid() = user_id);
  end if;
end $$;

grant usage on schema public to authenticated;
grant select on public.score_attack_high_scores to authenticated;
grant insert, update on public.score_attack_high_scores to authenticated;
grant select on public.score_attack_high_scores to anon;

grant select on public.v_score_attack_high_scores to authenticated;
grant select on public.v_score_attack_high_scores to anon;
