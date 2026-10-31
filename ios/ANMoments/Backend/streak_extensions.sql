-- Cloud streak (UTC daily calendar) with one server-controlled restore credit.
-- Run after schema.sql in an isolated test project.
begin;

create table if not exists public.streak_days (
  user_id uuid not null references public.profiles(id) on delete cascade,
  day date not null,
  source text not null check(source in ('post','restored')),
  created_at timestamptz not null default now(),
  primary key(user_id,day)
);
create table if not exists public.streak_wallets (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  credits int not null default 1 check(credits>=0 and credits<=30)
);
alter table public.streak_days enable row level security;
alter table public.streak_wallets enable row level security;
create policy "streak_own_days" on public.streak_days
  for select to authenticated using(user_id=(select auth.uid()));
create policy "streak_own_wallet" on public.streak_wallets
  for select to authenticated using(user_id=(select auth.uid()));
grant select on public.streak_days,public.streak_wallets to authenticated;

insert into public.streak_wallets(user_id)
  select id from public.profiles on conflict(user_id) do nothing;

-- Existing photos count as real posts (UTC day).
insert into public.streak_days(user_id,day,source)
  select distinct author_id,(created_at at time zone 'UTC')::date,'post'
  from public.moments
  on conflict (user_id,day) do update set
    source='post' where public.streak_days.source='restored';

create or replace function public.on_new_moment_streak()
returns trigger language plpgsql security definer set search_path=''
as $$
begin
  insert into public.streak_wallets(user_id)
    values(new.author_id) on conflict do nothing;
  insert into public.streak_days(user_id,day,source)
    values(new.author_id,(new.created_at at time zone 'UTC')::date,'post')
    on conflict(user_id,day) do update set
      source='post' where public.streak_days.source='restored';
  return new;
end;
$$;
drop trigger if exists anmoments_record_streak on public.moments;
create trigger anmoments_record_streak
  after insert on public.moments
  for each row execute function public.on_new_moment_streak();

-- Restore ONLY a one-day hole bracketed by two real posting days.
-- This cannot forge an actual moment and is atomically credit-limited.
create or replace function public.restore_streak(p_day date)
returns void language plpgsql security definer set search_path=''
as $$
declare v_me uuid := auth.uid(); v_credits int;
begin
  if v_me is null then raise exception 'Authentication required'; end if;
  if p_day >= (now() at time zone 'UTC')::date then
    raise exception 'Future/today restore not allowed'; end if;
  if not exists(
    select 1 from public.streak_days
    where user_id=v_me and day=p_day-1 and source='post'
  ) or not exists(
    select 1 from public.streak_days
    where user_id=v_me and day=p_day+1 and source='post'
  ) then raise exception 'Missing day is not between real posts'; end if;
  if exists(
    select 1 from public.streak_days where user_id=v_me and day=p_day
  ) then raise exception 'Day already recorded'; end if;
  insert into public.streak_wallets(user_id) values(v_me) on conflict do nothing;
  update public.streak_wallets set credits=credits-1
    where user_id=v_me and credits>0 returning credits into v_credits;
  if not found then raise exception 'No restore credits'; end if;
  insert into public.streak_days(user_id,day,source)
    values(v_me,p_day,'restored');
end;
$$;
revoke all on function public.restore_streak(date) from public;
grant execute on function public.restore_streak(date) to authenticated;
commit;

-- UTC means streak rollover happens at 07:00 in Bangkok (UTC+7).
-- Add an explicit profile time-zone preference before public launch.
