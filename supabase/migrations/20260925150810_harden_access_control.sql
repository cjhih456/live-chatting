-- Tighten Data API access: membership checks, friend consent, identity columns.

create schema if not exists private;

revoke all on schema private from public, anon;
grant usage on schema private to authenticated;

-- ---------------------------------------------------------------------------
-- Friend requests must be accepted before a profile is visible
-- ---------------------------------------------------------------------------

alter table public.friendships
  add column status text not null default 'pending'
    check (status in ('pending', 'accepted'));

create unique index friendships_canonical_pair_idx
  on public.friendships (least(user_id, friend_id), greatest(user_id, friend_id));

create unique index profiles_email_lower_idx
  on public.profiles (lower(email))
  where btrim(email) <> '';

alter table public.messages
  add constraint messages_body_length
  check (char_length(body) between 1 and 2000);

-- ---------------------------------------------------------------------------
-- Triggers live in an unexposed schema
-- ---------------------------------------------------------------------------

create function private.protect_profile_identity()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if new.id is distinct from old.id or new.email is distinct from old.email then
    raise exception 'profile identity columns are immutable';
  end if;
  return new;
end;
$$;

create trigger profiles_protect_identity
  before update on public.profiles
  for each row
  execute function private.protect_profile_identity();

create function private.protect_friendship()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if tg_op = 'INSERT' and new.status is distinct from 'pending' then
    raise exception 'new friendships must start pending';
  end if;

  if tg_op = 'UPDATE' then
    if new.id is distinct from old.id
      or new.user_id is distinct from old.user_id
      or new.friend_id is distinct from old.friend_id
      or new.created_at is distinct from old.created_at then
      raise exception 'friendship parties are immutable';
    end if;
    if old.status is distinct from 'pending' or new.status is distinct from 'accepted' then
      raise exception 'pending friendships can only be accepted';
    end if;
  end if;

  return new;
end;
$$;

create trigger friendships_protect
  before insert or update on public.friendships
  for each row
  execute function private.protect_friendship();

create function private.stamp_message()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.created_at := now();
  new.failed := false;
  return new;
end;
$$;

create trigger messages_stamp
  before insert on public.messages
  for each row
  execute function private.stamp_message();

create function private.touch_conversation()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.conversations
  set updated_at = now()
  where id = new.conversation_id;
  return new;
end;
$$;

create trigger messages_touch_conversation
  after insert on public.messages
  for each row
  execute function private.touch_conversation();

revoke all on function private.protect_profile_identity() from public, anon;
revoke all on function private.protect_friendship() from public, anon;
revoke all on function private.stamp_message() from public, anon;
revoke all on function private.touch_conversation() from public, anon;
grant execute on function private.protect_profile_identity() to authenticated;
grant execute on function private.protect_friendship() to authenticated;
grant execute on function private.stamp_message() to authenticated;
grant execute on function private.touch_conversation() to authenticated;

-- ---------------------------------------------------------------------------
-- Email lookup returns only id and name, as the owner, outside public RLS
-- ---------------------------------------------------------------------------

drop policy if exists "profiles_select_email_lookup" on public.profiles;
drop function if exists public.lookup_profile_by_email(text);

create function private.lookup_profile_by_email(p_email text)
returns table (
  id uuid,
  name text
)
language sql
security definer
set search_path = public
as $$
  select p.id, p.name
  from public.profiles p
  where lower(p.email) = lower(btrim(p_email))
    and btrim(p.email) <> ''
  limit 1;
$$;

create function private.list_friend_cards()
returns table (
  id uuid,
  name text,
  email text,
  avatar_url text,
  status text
)
language sql
stable
security definer
set search_path = public
as $$
  select
    other_profile.id,
    other_profile.name,
    case when f.status = 'accepted' then other_profile.email else null end,
    other_profile.avatar_url,
    case
      when f.status = 'accepted' then 'accepted'
      when f.user_id = auth.uid() then 'pending_out'
      else 'pending_in'
    end
  from public.friendships f
  join public.profiles other_profile
    on other_profile.id = case
      when f.user_id = auth.uid() then f.friend_id
      else f.user_id
    end
  where auth.uid() is not null
    and (f.user_id = auth.uid() or f.friend_id = auth.uid());
$$;

revoke all on function private.lookup_profile_by_email(text) from public, anon;
revoke all on function private.list_friend_cards() from public, anon;
grant execute on function private.lookup_profile_by_email(text) to authenticated;
grant execute on function private.list_friend_cards() to authenticated;

create function public.lookup_profile_by_email(p_email text)
returns table (
  id uuid,
  name text
)
language plpgsql
security invoker
set search_path = public, private
as $$
begin
  if auth.uid() is null or nullif(btrim(p_email), '') is null then
    return;
  end if;

  return query
    select found.id, found.name
    from private.lookup_profile_by_email(p_email) as found;
end;
$$;

create function public.list_friend_cards()
returns table (
  id uuid,
  name text,
  email text,
  avatar_url text,
  status text
)
language plpgsql
security invoker
set search_path = public, private
as $$
begin
  if auth.uid() is null then
    return;
  end if;

  return query
    select cards.id, cards.name, cards.email, cards.avatar_url, cards.status
    from private.list_friend_cards() as cards;
end;
$$;

revoke all on function public.lookup_profile_by_email(text) from public, anon;
revoke all on function public.list_friend_cards() from public, anon;
grant execute on function public.lookup_profile_by_email(text) to authenticated;
grant execute on function public.list_friend_cards() to authenticated;

-- ---------------------------------------------------------------------------
-- Policies: authenticated only, explicit table columns
-- ---------------------------------------------------------------------------

drop policy if exists "profiles_select_own" on public.profiles;
drop policy if exists "profiles_select_friends" on public.profiles;
drop policy if exists "profiles_update_own" on public.profiles;
drop policy if exists "settings_select_own" on public.user_settings;
drop policy if exists "settings_update_own" on public.user_settings;
drop policy if exists "conversation_members_select_own" on public.conversation_members;
drop policy if exists "friendships_select_party" on public.friendships;
drop policy if exists "friendships_insert_own" on public.friendships;
drop policy if exists "messages_insert_member" on public.messages;

create policy "profiles_select_own"
  on public.profiles for select
  to authenticated
  using (auth.uid() = id);

create policy "profiles_select_accepted_friends"
  on public.profiles for select
  to authenticated
  using (
    exists (
      select 1
      from public.friendships f
      where f.status = 'accepted'
        and (
          (f.user_id = auth.uid() and f.friend_id = profiles.id)
          or (f.friend_id = auth.uid() and f.user_id = profiles.id)
        )
    )
  );

create policy "profiles_update_own"
  on public.profiles for update
  to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

create policy "settings_select_own"
  on public.user_settings for select
  to authenticated
  using (auth.uid() = user_id);

create policy "settings_update_own"
  on public.user_settings for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "conversation_members_select_own"
  on public.conversation_members for select
  to authenticated
  using (user_id = auth.uid());

create policy "friendships_select_party"
  on public.friendships for select
  to authenticated
  using (auth.uid() = user_id or auth.uid() = friend_id);

create policy "friendships_insert_own"
  on public.friendships for insert
  to authenticated
  with check (auth.uid() = user_id and status = 'pending');

create policy "friendships_update_accept"
  on public.friendships for update
  to authenticated
  using (auth.uid() = friend_id and status = 'pending')
  with check (auth.uid() = friend_id and status = 'accepted');

create policy "friendships_delete_party"
  on public.friendships for delete
  to authenticated
  using (
    (auth.uid() = user_id and status = 'pending')
    or (auth.uid() = friend_id and status = 'pending')
    or (
      status = 'accepted'
      and (auth.uid() = user_id or auth.uid() = friend_id)
    )
  );

create policy "messages_insert_member"
  on public.messages for insert
  to authenticated
  with check (
    sender_id = auth.uid()
    and exists (
      select 1
      from public.conversation_members cm
      where cm.conversation_id = messages.conversation_id
        and cm.user_id = auth.uid()
    )
  );

-- ---------------------------------------------------------------------------
-- Least privilege for the Data API roles
-- ---------------------------------------------------------------------------

revoke all on table
  public.profiles,
  public.user_settings,
  public.conversations,
  public.conversation_members,
  public.messages,
  public.friendships
from anon, authenticated;

grant select on public.profiles to authenticated;
grant update (name, bio, avatar_url, updated_at) on public.profiles to authenticated;

grant select on public.user_settings to authenticated;
grant update (
  theme,
  locale,
  push_enabled,
  sound_enabled,
  preview_enabled,
  updated_at
) on public.user_settings to authenticated;

grant select on public.conversations to authenticated;
grant select on public.conversation_members to authenticated;

grant select (
  id,
  conversation_id,
  sender_id,
  body,
  created_at,
  failed
) on public.messages to authenticated;
grant insert (conversation_id, sender_id, body) on public.messages to authenticated;

grant select on public.friendships to authenticated;
grant insert (user_id, friend_id) on public.friendships to authenticated;
grant update (status) on public.friendships to authenticated;
grant delete on public.friendships to authenticated;
