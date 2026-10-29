-- AN Moments private photo sharing MVP
-- Run in a NEW Supabase project using SQL Editor.
-- Never expose the service_role key in the iOS app.
create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  handle text unique not null check (handle ~ '^[a-z0-9_]{3,24}$'),
  display_name text not null default 'Người bạn' check (char_length(display_name) between 1 and 80),
  created_at timestamptz not null default now()
);

create table if not exists public.friend_requests (
  id uuid primary key default gen_random_uuid(),
  from_user uuid not null references public.profiles(id) on delete cascade,
  to_user uuid not null references public.profiles(id) on delete cascade,
  status text not null default 'pending' check (status in ('pending', 'accepted', 'declined')),
  created_at timestamptz not null default now(),
  check (from_user <> to_user)
);

create unique index if not exists friend_requests_pending_uniq
  on public.friend_requests (from_user, to_user) where status = 'pending';

create table if not exists public.friendships (
  user_id uuid not null references public.profiles(id) on delete cascade,
  friend_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key(user_id, friend_id),
  check(user_id <> friend_id)
);

create table if not exists public.moments (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references public.profiles(id) on delete cascade,
  storage_path text unique not null,
  caption text not null default '' check (char_length(caption) <= 1000),
  created_at timestamptz not null default now(),
  check(storage_path like (author_id::text || '/%'))
);

create table if not exists public.moment_recipients (
  moment_id uuid not null references public.moments(id) on delete cascade,
  recipient_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key(moment_id, recipient_id)
);

create index if not exists idx_moments_author on public.moments(author_id, created_at desc);
create index if not exists idx_recipients_user on public.moment_recipients(recipient_id);

-- New users receive an opaque, unique handle, not their private email.
create or replace function public.on_new_account()
returns trigger language plpgsql security definer set search_path = ''
as $$
begin
  insert into public.profiles(id, handle, display_name)
  values (
    new.id,
    'u_' || left(replace(new.id::text, '-', ''), 16),
    coalesce(nullif(split_part(new.email, '@', 1), ''), 'Người bạn')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists an_moments_on_user_created on auth.users;
create trigger an_moments_on_user_created
  after insert on auth.users
  for each row execute function public.on_new_account();

-- Backfill existing test users for the first installation.
insert into public.profiles(id, handle, display_name)
select u.id, 'u_' || left(replace(u.id::text, '-', ''), 16),
       coalesce(nullif(split_part(u.email, '@', 1), ''), 'Người bạn')
from auth.users u
on conflict (id) do nothing;

alter table public.profiles enable row level security;
alter table public.friend_requests enable row level security;
alter table public.friendships enable row level security;
alter table public.moments enable row level security;
alter table public.moment_recipients enable row level security;

-- Profile handles are discoverable; email is never exposed in this table.
create policy "profiles_read_authenticated" on public.profiles
  for select to authenticated using (true);
create policy "profiles_edit_self" on public.profiles
  for update to authenticated using (id = (select auth.uid()))
  with check (id = (select auth.uid()));

-- Requests and friendship edges are controlled exclusively by vetted RPCs.
create policy "requests_read_participants" on public.friend_requests
  for select to authenticated
  using (from_user = (select auth.uid()) or to_user = (select auth.uid()));
create policy "friends_read_self" on public.friendships
  for select to authenticated using (user_id = (select auth.uid()));

-- Recipients can read only their own recipient edge. This avoids RLS recursion.
create policy "recipient_read_self" on public.moment_recipients
  for select to authenticated using (recipient_id = (select auth.uid()));
create policy "recipient_insert_by_author_to_friend" on public.moment_recipients
  for insert to authenticated
  with check (
    exists (
      select 1 from public.moments m
      where m.id = moment_id and m.author_id = (select auth.uid())
    )
    and exists (
      select 1 from public.friendships f
      where f.user_id = (select auth.uid()) and f.friend_id = recipient_id
    )
  );

-- A moment is visible only to its author or an explicit recipient.
create policy "moment_read_author_or_recipient" on public.moments
  for select to authenticated
  using (
    author_id = (select auth.uid())
    or exists (
      select 1 from public.moment_recipients mr
      where mr.moment_id = id and mr.recipient_id = (select auth.uid())
    )
  );

create policy "moment_insert_author" on public.moments
  for insert to authenticated
  with check (author_id = (select auth.uid()));
create policy "moment_delete_author" on public.moments
  for delete to authenticated
  using (author_id = (select auth.uid()));

-- Join by handle with consent; no public exposure of user email.
create or replace function public.request_friend(recipient_handle text)
returns void language plpgsql security definer set search_path = ''
as $$
declare
  recipient uuid;
begin
  if auth.uid() is null then raise exception 'Authentication required'; end if;
  select id into recipient from public.profiles where handle = lower(trim(recipient_handle));
  if recipient is null then raise exception 'Username not found'; end if;
  if recipient = auth.uid() then raise exception 'Cannot add yourself'; end if;
  if exists(select 1 from public.friendships where user_id = auth.uid() and friend_id = recipient)
     then raise exception 'Already friends'; end if;
  if exists(select 1 from public.friend_requests
            where status = 'pending'
              and ((from_user = auth.uid() and to_user = recipient)
                or (to_user = auth.uid() and from_user = recipient)))
     then raise exception 'Invitation already pending'; end if;
  insert into public.friend_requests(from_user,to_user) values(auth.uid(),recipient);
end;
$$;

create or replace function public.accept_friend(request_id uuid)
returns void language plpgsql security definer set search_path = ''
as $$
declare
  pending record;
begin
  if auth.uid() is null then raise exception 'Authentication required'; end if;
  select * into pending
  from public.friend_requests
  where id = request_id and to_user = auth.uid() and status = 'pending'
  for update;
  if not found then raise exception 'Request not found'; end if;
  update public.friend_requests set status='accepted' where id = request_id;
  insert into public.friendships(user_id, friend_id)
  values (pending.from_user, pending.to_user), (pending.to_user, pending.from_user)
  on conflict do nothing;
end;
$$;

revoke all on function public.request_friend(text) from public;
revoke all on function public.accept_friend(uuid) from public;
grant execute on function public.request_friend(text) to authenticated;
grant execute on function public.accept_friend(uuid) to authenticated;

-- Private image bucket, never a public read bucket.
insert into storage.buckets(id, name, public, file_size_limit, allowed_mime_types)
values ('moments', 'moments', false, 10485760, array['image/jpeg'])
on conflict (id) do update set
  public = false,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

create policy "storage_upload_own_folder" on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'moments'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

create policy "storage_read_author_or_explicit_recipient" on storage.objects
  for select to authenticated
  using (
    bucket_id = 'moments'
    and (
      (storage.foldername(name))[1] = (select auth.uid())::text
      or exists (
        select 1 from public.moments m
        join public.moment_recipients r on r.moment_id = m.id
        where m.storage_path = name
          and r.recipient_id = (select auth.uid())
      )
    )
  );

create policy "storage_delete_own_folder" on storage.objects
  for delete to authenticated
  using (
    bucket_id = 'moments'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

-- Hardening reminder:
-- 1. Configure email OTP template with {{ .Token }}.
-- 2. Apply rate limiting and abuse controls before public launch.
-- 3. Add account deletion / content moderation / report-and-block flows.
-- 4. Test RLS with two different authenticated identities.
