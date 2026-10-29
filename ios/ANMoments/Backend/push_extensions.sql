-- APNs delivery device token registry.
-- Run AFTER schema.sql / social_extensions.sql in isolated project.
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
create policy "push_token_insert_own" on public.device_push_tokens
  for insert to authenticated
  with check(user_id=(select auth.uid()));
create policy "push_token_update_own" on public.device_push_tokens
  for update to authenticated
  using(user_id=(select auth.uid()))
  with check(user_id=(select auth.uid()));
create policy "push_token_delete_own" on public.device_push_tokens
  for delete to authenticated using(user_id=(select auth.uid()));

grant select,insert,delete on public.device_push_tokens to authenticated;
grant update(user_id,platform,updated_at) on public.device_push_tokens to authenticated;

commit;

-- No pg_net trigger is installed automatically. Connect activity_events INSERT
-- to the deployable notify-event Edge Function using an authenticated
-- Database Webhook with secret header, after human review in Dashboard.
-- No APNs private key should ever appear in SQL or the iOS source.
