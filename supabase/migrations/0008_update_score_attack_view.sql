-- Ensure score attack leaderboard reflects latest profile display names

create or replace view public.v_score_attack_high_scores as
  select
    sahs.user_id,
    coalesce(p.display_name, sahs.display_name) as display_name,
    sahs.best_score,
    sahs.updated_at
  from public.score_attack_high_scores sahs
  left join public.profiles p on p.user_id = sahs.user_id
  order by sahs.best_score desc, sahs.updated_at asc;

grant select on public.v_score_attack_high_scores to authenticated;
grant select on public.v_score_attack_high_scores to anon;
