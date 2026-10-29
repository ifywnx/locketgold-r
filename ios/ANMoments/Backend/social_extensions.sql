-- AN Moments optional social extension.
-- Run AFTER Backend/schema.sql on a new, isolated Supabase project.
-- Review & test as authenticated users A/B/C; this script is NOT auto-applied.
-- No object in the reserved realtime schema is modified.
begin;

create table if not exists public.user_blocks (
  blocker_id uuid not null references public.profiles(id) on delete cascade,
  blocked_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key(blocker_id, blocked_id),
  check(blocker_id <> blocked_id)
);

create table if not exists public.user_reports (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid not null references public.profiles(id) on delete cascade,
  reported_id uuid references public.profiles(id) on delete set null,
  category text not null check(category in ('spam','harassment','inappropriate','other')),
  details text not null default '' check(char_length(details) <= 1000),
  status text not null default 'pending' check(status in ('pending','reviewed','closed')),
  created_at timestamptz not null default now()
);

create table if not exists public.account_deletion_requests (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  requested_at timestamptz not null default now(),
  status text not null default 'pending' check(status in ('pending','processing','completed'))
);

create table if not exists public.conversations (
  id uuid primary key default gen_random_uuid(),
  kind text not null check(kind in ('direct','group')),
  title text not null default '' check(char_length(title) <= 80),
  created_by uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now()
);

create table if not exists public.conversation_members (
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  joined_at timestamptz not null default now(),
  primary key(conversation_id,user_id)
);

create table if not exists public.chat_messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  sender_id uuid not null references public.profiles(id) on delete cascade,
  body text not null check(char_length(body) between 1 and 2000),
  created_at timestamptz not null default now()
);
create index if not exists chat_messages_timeline
  on public.chat_messages(conversation_id,created_at desc);
create index if not exists conversation_members_user
  on public.conversation_members(user_id,conversation_id);

create table if not exists public.activity_events (
  id uuid primary key default gen_random_uuid(),
  recipient_id uuid not null references public.profiles(id) on delete cascade,
  actor_id uuid references public.profiles(id) on delete set null,
  event_kind text not null check(event_kind in ('friend_request','moment','message')),
  summary text not null check(char_length(summary) <= 150),
  created_at timestamptz not null default now(),
  read_at timestamptz
);
create index if not exists activity_events_recipient
  on public.activity_events(recipient_id,created_at desc);

alter table public.user_blocks enable row level security;
alter table public.user_reports enable row level security;
alter table public.account_deletion_requests enable row level security;
alter table public.conversations enable row level security;
alter table public.conversation_members enable row level security;
alter table public.chat_messages enable row level security;
alter table public.activity_events enable row level security;

create policy "blocks_own_read" on public.user_blocks
  for select to authenticated using(blocker_id = (select auth.uid()));
create policy "blocks_own_insert" on public.user_blocks
  for insert to authenticated
  with check(blocker_id = (select auth.uid()));
create policy "blocks_own_delete" on public.user_blocks
  for delete to authenticated using(blocker_id = (select auth.uid()));

create policy "reports_submit_self" on public.user_reports
  for insert to authenticated
  with check(reporter_id = (select auth.uid()));
create policy "reports_read_self" on public.user_reports
  for select to authenticated
  using(reporter_id = (select auth.uid()));

create policy "deletion_requests_self_insert" on public.account_deletion_requests
  for insert to authenticated
  with check(user_id = (select auth.uid()) and status = 'pending');
create policy "deletion_requests_self_read" on public.account_deletion_requests
  for select to authenticated using(user_id = (select auth.uid()));

-- Selecting another person's membership is not necessary for the MVP.
-- Conversations and messages rely only on the user's own membership row.
create policy "members_self_select" on public.conversation_members
  for select to authenticated using(user_id = (select auth.uid()));
create policy "conversations_participants_only" on public.conversations
  for select to authenticated using(
    exists(select 1 from public.conversation_members cm
           where cm.conversation_id = id and cm.user_id = (select auth.uid()))
  );
create policy "chat_messages_participants_only" on public.chat_messages
  for select to authenticated using(
    exists(select 1 from public.conversation_members cm
           where cm.conversation_id = chat_messages.conversation_id
             and cm.user_id = (select auth.uid()))
  );
-- Chat writes are ONLY through send_chat_message below; no direct insert policy.

create policy "activity_read_self" on public.activity_events
  for select to authenticated using(recipient_id = (select auth.uid()));
create policy "activity_mark_read_self" on public.activity_events
  for update to authenticated
  using(recipient_id = (select auth.uid()))
  with check(recipient_id = (select auth.uid()));
-- Events are inserted by the server-side triggers, no client insert policy.

-- Avoid exposing security-definer functions to anonymous users.
-- All function arguments that identify an actor are derived from auth.uid().
create or replace function public.start_direct_chat(p_other uuid)
returns uuid
language plpgsql security definer set search_path = ''
as $$
declare v_chat uuid; v_me uuid := (select auth.uid());
begin
  if v_me is null or p_other is null or p_other = v_me then
    raise exception 'Invalid user'; end if;
  if not exists(select 1 from public.friendships
    where user_id=v_me and friend_id=p_other) then
    raise exception 'Friendship required'; end if;
  if exists(select 1 from public.user_blocks b
    where (b.blocker_id=v_me and b.blocked_id=p_other)
       or (b.blocker_id=p_other and b.blocked_id=v_me)) then
    raise exception 'Conversation blocked'; end if;

  select c.id into v_chat from public.conversations c
  where c.kind='direct'
    and (select count(*) from public.conversation_members m
         where m.conversation_id=c.id)=2
    and exists(select 1 from public.conversation_members m
               where m.conversation_id=c.id and m.user_id=v_me)
    and exists(select 1 from public.conversation_members m
               where m.conversation_id=c.id and m.user_id=p_other)
  order by c.created_at limit 1;

  if v_chat is not null then return v_chat; end if;
  insert into public.conversations(kind,title,created_by)
    values('direct','',v_me) returning id into v_chat;
  insert into public.conversation_members(conversation_id,user_id)
    values(v_chat,v_me),(v_chat,p_other);
  return v_chat;
end;
$$;

create or replace function public.start_group_chat(p_title text, p_friends uuid[])
returns uuid language plpgsql security definer set search_path = ''
as $$
declare v_me uuid := (select auth.uid()); v_group uuid;
        v_count int; v_friend uuid;
begin
  if v_me is null then raise exception 'Authentication required'; end if;
  if nullif(trim(p_title),'') is null or char_length(p_title)>80 then
    raise exception 'Group title required (maximum 80 characters)'; end if;
  select count(distinct f) into v_count
    from unnest(coalesce(p_friends,array[]::uuid[])) as f;
  if v_count < 1 or v_count > 19 then
    raise exception 'Group requires 1-19 friends'; end if;
  for v_friend in
    select distinct f from unnest(p_friends) as f
  loop
    if v_friend = v_me or v_friend is null
       or not exists(select 1 from public.friendships
                     where user_id=v_me and friend_id=v_friend)
       or exists(select 1 from public.user_blocks b
                 where (b.blocker_id=v_me and b.blocked_id=v_friend)
                    or (b.blocker_id=v_friend and b.blocked_id=v_me))
    then raise exception 'Each member must be an unblocked friend'; end if;
  end loop;
  insert into public.conversations(kind,title,created_by)
    values('group',trim(p_title),v_me) returning id into v_group;
  insert into public.conversation_members(conversation_id,user_id)
    values(v_group,v_me);
  insert into public.conversation_members(conversation_id,user_id)
    select v_group, f from
      (select distinct unnest(p_friends) as f) as friends;
  return v_group;
end;
$$;

create or replace function public.send_chat_message(
  p_conversation uuid, p_body text
)
returns uuid language plpgsql security definer set search_path = ''
as $$
declare v_me uuid := (select auth.uid()); v_message uuid;
begin
  if v_me is null or p_conversation is null then
    raise exception 'Authentication required'; end if;
  if nullif(trim(p_body),'') is null or char_length(p_body)>2000 then
    raise exception 'Message length must be 1-2000 characters'; end if;
  if not exists(select 1 from public.conversation_members
    where conversation_id=p_conversation and user_id=v_me) then
    raise exception 'Not a participant'; end if;
  if exists(
    select 1 from public.conversation_members cm
      join public.user_blocks b on
        (b.blocker_id=v_me and b.blocked_id=cm.user_id)
        or (b.blocker_id=cm.user_id and b.blocked_id=v_me)
    where cm.conversation_id=p_conversation
  ) then raise exception 'Chat unavailable due to a block'; end if;
  insert into public.chat_messages(conversation_id,sender_id,body)
    values(p_conversation,v_me,trim(p_body)) returning id into v_message;
  return v_message;
end;
$$;

create or replace function public.block_account(p_other uuid)
returns void language plpgsql security definer set search_path = ''
as $$
declare v_me uuid := (select auth.uid());
begin
  if v_me is null or p_other is null or p_other=v_me then
    raise exception 'Invalid user'; end if;
  insert into public.user_blocks(blocker_id,blocked_id)
    values(v_me,p_other) on conflict do nothing;
  delete from public.friendships
    where (user_id=v_me and friend_id=p_other)
       or (user_id=p_other and friend_id=v_me);
  delete from public.friend_requests
    where (from_user=v_me and to_user=p_other)
       or (from_user=p_other and to_user=v_me);
end;
$$;

-- A blocked user cannot invite the blocker again; original RPC checked here.
create or replace function public.request_friend(recipient_handle text)
returns void language plpgsql security definer set search_path = ''
as $$
declare v_me uuid := (select auth.uid()); recipient uuid;
begin
  if v_me is null then raise exception 'Authentication required'; end if;
  select id into recipient from public.profiles
    where handle=lower(trim(recipient_handle));
  if recipient is null or recipient=v_me then raise exception 'Invalid recipient'; end if;
  if exists(select 1 from public.user_blocks
    where (blocker_id=v_me and blocked_id=recipient)
       or (blocker_id=recipient and blocked_id=v_me))
  then raise exception 'Account unavailable'; end if;
  if exists(select 1 from public.friendships
    where user_id=v_me and friend_id=recipient)
  then raise exception 'Already friends'; end if;
  if exists(select 1 from public.friend_requests
    where status='pending' and
      ((from_user=v_me and to_user=recipient)
       or (to_user=v_me and from_user=recipient)))
  then raise exception 'Invitation pending'; end if;
  insert into public.friend_requests(from_user,to_user) values(v_me,recipient);
end;
$$;

-- Block check for friend-request acceptance too.
create or replace function public.accept_friend(request_id uuid)
returns void language plpgsql security definer set search_path = ''
as $$
declare pending record; v_me uuid := (select auth.uid());
begin
  if v_me is null then raise exception 'Authentication required'; end if;
  select * into pending from public.friend_requests
    where id=request_id and to_user=v_me and status='pending' for update;
  if not found then raise exception 'Request unavailable'; end if;
  if exists(select 1 from public.user_blocks
    where (blocker_id=v_me and blocked_id=pending.from_user)
       or (blocker_id=pending.from_user and blocked_id=v_me))
  then raise exception 'Account unavailable'; end if;
  update public.friend_requests set status='accepted' where id=request_id;
  insert into public.friendships(user_id,friend_id)
    values(pending.from_user,pending.to_user),(pending.to_user,pending.from_user)
    on conflict do nothing;
end;
$$;

-- Notifications remain inside the app. These do NOT send APNs notifications.
create or replace function public.on_chat_notification()
returns trigger language plpgsql security definer set search_path = ''
as $$
begin
  insert into public.activity_events(recipient_id,actor_id,event_kind,summary)
  select m.user_id,new.sender_id,'message','Tin nhắn mới'
  from public.conversation_members m
  where m.conversation_id=new.conversation_id and m.user_id<>new.sender_id;
  return new;
end;
$$;
drop trigger if exists social_chat_notification on public.chat_messages;
create trigger social_chat_notification after insert on public.chat_messages
  for each row execute function public.on_chat_notification();

create or replace function public.on_friend_notification()
returns trigger language plpgsql security definer set search_path = ''
as $$
begin
  insert into public.activity_events(recipient_id,actor_id,event_kind,summary)
  values(new.to_user,new.from_user,'friend_request','Có lời mời kết bạn');
  return new;
end;
$$;
drop trigger if exists social_friend_notification on public.friend_requests;
create trigger social_friend_notification after insert on public.friend_requests
  for each row execute function public.on_friend_notification();

create or replace function public.on_moment_notification()
returns trigger language plpgsql security definer set search_path = ''
as $$
begin
  insert into public.activity_events(recipient_id,actor_id,event_kind,summary)
  select new.recipient_id,m.author_id,'moment','Bạn nhận được khoảnh khắc'
    from public.moments m where m.id=new.moment_id;
  return new;
end;
$$;
drop trigger if exists social_moment_notification on public.moment_recipients;
create trigger social_moment_notification after insert on public.moment_recipients
  for each row execute function public.on_moment_notification();

-- Database API exposure must be explicit on newer Supabase projects.
grant usage on schema public to authenticated;
grant select on public.conversations, public.conversation_members,
  public.chat_messages, public.activity_events, public.user_blocks,
  public.user_reports, public.account_deletion_requests to authenticated;
grant insert on public.user_blocks, public.user_reports,
  public.account_deletion_requests to authenticated;
grant delete on public.user_blocks to authenticated;
grant update(read_at) on public.activity_events to authenticated;

-- Lock privileged RPCs down to authenticated callers.
revoke all on function public.start_direct_chat(uuid) from public;
revoke all on function public.start_group_chat(text,uuid[]) from public;
revoke all on function public.send_chat_message(uuid,text) from public;
revoke all on function public.block_account(uuid) from public;
grant execute on function public.start_direct_chat(uuid) to authenticated;
grant execute on function public.start_group_chat(text,uuid[]) to authenticated;
grant execute on function public.send_chat_message(uuid,text) to authenticated;
grant execute on function public.block_account(uuid) to authenticated;

commit;

-- Explicit user-facing limitation: account_deletion_requests is a QUEUE,
-- not actual Auth/Storage deletion. A separately secured server worker
-- must fulfill the request and remove stored media.
