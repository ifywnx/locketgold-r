-- AN Moments: private APNs token registry. Apply on a NEW Supabase project.
-- Run after schema.sql and social_extensions.sql.
begin;

create table if not exists public.device_push_tokens (
  token text primary key check(token ~ '^[0-9a-f]{64,256}$'),
  user_id uuid not null references public.profiles(id) on delete cascade,
  platform text not null default 'ios' check(platform='ios'),
  updated_at timestamptz not null default now()
);

create index if not exists device_tokens_user
  on public.device_push_tokens(user_id);

alter table public.device_push_tokens enable row level security;
create policy "push_token_read_own" on public.device_push_tokens
  for select to authenticated using(user_id=(select auth.uid()));
create policy "push_token_delete_own" on public.device_push_tokens
  for delete to authenticated using(user_id=(select auth.uid()));

-- Privileged RPC rebinds a token after device account switch. No user id is
-- supplied by the client: it comes only from verified auth.uid().
create or replace function public.register_push_token(p_token text)
returns void language plpgsql security definer set search_path=''
as $$
begin
  if auth.uid() is null then raise exception 'Authentication required'; end if;
  if p_token !~ '^[0-9a-f]{64,256}$' then
    raise exception 'Invalid APNs token';
  end if;
  insert into public.device_push_tokens(token,user_id)
    values(p_token,auth.uid())
    on conflict(token) do update set
      user_id=excluded.user_id,updated_at=now();
end;
$$;
revoke all on function public.register_push_token(text) from public;
grant execute on function public.register_push_token(text) to authenticated;

grant usage on schema public to authenticated;
grant select,delete on public.device_push_tokens to authenticated;

commit;

-- Do not install an open/public webhook. A trusted activity_events
-- database webhook with secret apikey must invoke notify-event.
-- APNs credentials belong only in Supabase Edge Function secrets.
