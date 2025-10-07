-- Reorder leaderboard view to prioritize current streak values
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
order by us.current_streak desc, us.best_streak desc, us.updated_at asc;
