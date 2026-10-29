-- AN Moments v1.2 media, group sharing, and message attachment extension.
-- Apply AFTER schema.sql and social_extensions.sql in a NEW test project.
-- Require RLS negative tests before using with real user data.
begin;

alter table public.chat_messages add column if not exists media_path text;
alter table public.chat_messages add column if not exists media_kind text;
alter table public.chat_messages drop constraint if exists chat_messages_media_kind_check;
alter table public.chat_messages add constraint chat_messages_media_kind_check
  check (media_kind is null or media_kind in ('photo','video'));
alter table public.chat_messages add constraint chat_messages_media_pair_check
  check ((media_path is null and media_kind is null)
      or (media_path is not null and media_kind is not null));

insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
values ('chat_media','chat_media',false,104857600,
        array['image/jpeg','video/quicktime'])
on conflict(id) do update set
    public=false,
    file_size_limit=excluded.file_size_limit,
    allowed_mime_types=excluded.allowed_mime_types;

-- Only uploader can create an object under <own-uuid>/<random-uuid>.ext.
create policy "chat_media_insert_owned" on storage.objects
for insert to authenticated with check (
  bucket_id='chat_media'
  and (storage.foldername(name))[1]=(select auth.uid())::text
  and (name like '%.jpg' or name like '%.mov')
);

-- Read after the media has been attached to a conversation whose membership
-- includes current user. Author can read own file for failed-upload cleanup.
create policy "chat_media_select_members" on storage.objects
for select to authenticated using (
  bucket_id='chat_media'
  and (
    (storage.foldername(name))[1]=(select auth.uid())::text
    or exists (
      select 1 from public.chat_messages msg
      join public.conversation_members cm
        on cm.conversation_id=msg.conversation_id
      where msg.media_path=name and cm.user_id=(select auth.uid())
    )
  )
);

create policy "chat_media_delete_owned" on storage.objects
for delete to authenticated using (
  bucket_id='chat_media'
  and (storage.foldername(name))[1]=(select auth.uid())::text
);

-- A server-side RPC is required to bind uploaded objects to messages.
-- It enforces sender identity, membership, block status, and path ownership.
create or replace function public.send_chat_media(
  p_conversation uuid, p_path text, p_kind text, p_caption text default ''
)
returns uuid
language plpgsql security definer set search_path=''
as $$
declare v_me uuid := auth.uid();
        v_msg uuid;
begin
  if v_me is null then raise exception 'Authentication required'; end if;
  if p_kind not in ('photo','video') then raise exception 'Unsupported media'; end if;
  if (p_kind='photo' and p_path not like '%.jpg') or
     (p_kind='video' and p_path not like '%.mov') then
    raise exception 'Incorrect media extension'; end if;
  if p_path not like (v_me::text || '/%') then
    raise exception 'Media must belong to sender'; end if;
  if char_length(coalesce(p_caption,''))>2000 then
    raise exception 'Caption too long'; end if;
  if not exists(select 1 from public.conversation_members
                where conversation_id=p_conversation and user_id=v_me) then
    raise exception 'Not a member'; end if;
  if exists(
    select 1 from public.conversation_members cm
    join public.user_blocks b on
      (b.blocker_id=v_me and b.blocked_id=cm.user_id) or
      (b.blocker_id=cm.user_id and b.blocked_id=v_me)
    where cm.conversation_id=p_conversation
  ) then raise exception 'Chat unavailable'; end if;
  if not exists(
    select 1 from storage.objects obj
    where obj.bucket_id='chat_media' and obj.name=p_path
  ) then raise exception 'Uploaded file not found'; end if;
  if exists(select 1 from public.chat_messages where media_path=p_path) then
    raise exception 'Media already attached'; end if;

  insert into public.chat_messages(
    conversation_id,sender_id,body,media_path,media_kind
  ) values(p_conversation,v_me,coalesce(nullif(trim(p_caption),''),
     case when p_kind='photo' then 'Ảnh' else 'Video' end),
     p_path,p_kind)
  returning id into v_msg;
  return v_msg;
end;
$$;
revoke all on function public.send_chat_media(uuid,text,text,text) from public;
grant execute on function public.send_chat_media(uuid,text,text,text) to authenticated;

-- A moment shared to a group is visible only to existing members at posting time.
-- Do not silently broadcast to arbitrary users outside the group.
create or replace function public.publish_moment_group(
  p_id uuid, p_path text, p_caption text, p_media_kind text, p_group uuid
)
returns void
language plpgsql security definer set search_path=''
as $$
declare v_me uuid := auth.uid();
begin
  if v_me is null then raise exception 'Authentication required'; end if;
  if p_media_kind not in ('photo','video') or char_length(p_caption)>2000 then
    raise exception 'Invalid media or caption'; end if;
  if p_path not like (v_me::text || '/%') then
    raise exception 'Invalid storage path'; end if;
  if (p_media_kind='photo' and p_path not like '%.jpg') or
     (p_media_kind='video' and p_path not like '%.mov') then
    raise exception 'Invalid extension'; end if;
  if not exists(
    select 1 from public.conversations c
    join public.conversation_members cm on cm.conversation_id=c.id
    where c.id=p_group and c.kind='group' and cm.user_id=v_me
  ) then raise exception 'You are not a member of this group'; end if;
  if exists(
    select 1 from public.conversation_members cm
    join public.user_blocks b on
      (b.blocker_id=v_me and b.blocked_id=cm.user_id)
      or (b.blocker_id=cm.user_id and b.blocked_id=v_me)
    where cm.conversation_id=p_group
  ) then raise exception 'Group contains blocked accounts'; end if;

  insert into public.moments(id,author_id,storage_path,caption,media_kind)
  values(p_id,v_me,p_path,coalesce(p_caption,''),p_media_kind);
  insert into public.moment_recipients(moment_id,recipient_id)
    select p_id,cm.user_id from public.conversation_members cm
    where cm.conversation_id=p_group and cm.user_id<>v_me;
end;
$$;
revoke all on function public.publish_moment_group(uuid,text,text,text,uuid) from public;
grant execute on function public.publish_moment_group(uuid,text,text,text,uuid) to authenticated;

-- Notifications continue to use the existing activity_events trigger.
grant select on public.chat_messages to authenticated;
commit;

-- Realtime is opt-in: an administrator must enable both chat_messages and
-- activity_events in the Supabase Realtime publication in Dashboard.
-- Do not enable for public profile data. Verify RLS with accounts A/B/C.
