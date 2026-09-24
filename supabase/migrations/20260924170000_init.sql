-- Lumen initial schema: profiles, settings, chat, friendships + RLS

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- Tables
-- ---------------------------------------------------------------------------

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  name text not null default '',
  email text not null default '',
  bio text not null default '',
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.user_settings (
  user_id uuid primary key references public.profiles (id) on delete cascade,
  theme text not null default 'system'
    check (theme in ('light', 'dark', 'system')),
  locale text not null default 'ko'
    check (locale in ('ko', 'en', 'ja')),
  push_enabled boolean not null default true,
  sound_enabled boolean not null default true,
  preview_enabled boolean not null default true,
  updated_at timestamptz not null default now()
);

create table public.conversations (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  is_group boolean not null default false,
  avatar_url text,
  updated_at timestamptz not null default now()
);

create table public.conversation_members (
  conversation_id uuid not null references public.conversations (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  unread_count integer not null default 0 check (unread_count >= 0),
  primary key (conversation_id, user_id)
);

create table public.messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations (id) on delete cascade,
  sender_id uuid not null references public.profiles (id) on delete cascade,
  body text not null,
  created_at timestamptz not null default now(),
  failed boolean not null default false
);

create table public.friendships (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  friend_id uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (user_id, friend_id),
  check (user_id <> friend_id)
);

create index messages_conversation_created_idx
  on public.messages (conversation_id, created_at desc);

create index conversation_members_user_idx
  on public.conversation_members (user_id);

create index friendships_user_idx on public.friendships (user_id);
create index friendships_friend_idx on public.friendships (friend_id);

-- ---------------------------------------------------------------------------
-- Row level security
-- ---------------------------------------------------------------------------

alter table public.profiles enable row level security;
alter table public.user_settings enable row level security;
alter table public.conversations enable row level security;
alter table public.conversation_members enable row level security;
alter table public.messages enable row level security;
alter table public.friendships enable row level security;

-- profiles: own row only
create policy "profiles_select_own"
  on public.profiles for select
  using (auth.uid() = id);

create policy "profiles_update_own"
  on public.profiles for update
  using (auth.uid() = id);

-- Friends may read each other's public profile fields.
create policy "profiles_select_friends"
  on public.profiles for select
  using (
    auth.uid() = id
    or exists (
      select 1
      from public.friendships f
      where (
        f.user_id = auth.uid() and f.friend_id = profiles.id
      ) or (
        f.friend_id = auth.uid() and f.user_id = profiles.id
      )
    )
  );

create or replace function public.lookup_profile_by_email(p_email text)
returns table (
  id uuid,
  name text,
  email text,
  bio text,
  avatar_url text
)
language sql
security definer
set search_path = public
as $$
  select p.id, p.name, p.email, p.bio, p.avatar_url
  from public.profiles p
  where p.email = p_email
  limit 1;
$$;

revoke all on function public.lookup_profile_by_email(text) from public;
grant execute on function public.lookup_profile_by_email(text) to authenticated;

-- user_settings: own row only
create policy "settings_select_own"
  on public.user_settings for select
  using (auth.uid() = user_id);

create policy "settings_update_own"
  on public.user_settings for update
  using (auth.uid() = user_id);

-- conversation membership helper
create or replace function public.is_conversation_member(p_conversation_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.conversation_members cm
    where cm.conversation_id = p_conversation_id
      and cm.user_id = auth.uid()
  );
$$;

create policy "conversation_members_select_own"
  on public.conversation_members for select
  using (user_id = auth.uid());

create policy "conversations_select_member"
  on public.conversations for select
  using (public.is_conversation_member(id));

create policy "messages_select_member"
  on public.messages for select
  using (public.is_conversation_member(conversation_id));

create policy "messages_insert_member"
  on public.messages for insert
  with check (
    sender_id = auth.uid()
    and public.is_conversation_member(conversation_id)
  );

-- friendships: visible to either party
create policy "friendships_select_party"
  on public.friendships for select
  using (auth.uid() = user_id or auth.uid() = friend_id);

create policy "friendships_insert_own"
  on public.friendships for insert
  with check (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- Realtime
-- ---------------------------------------------------------------------------

alter publication supabase_realtime add table public.messages;

-- ---------------------------------------------------------------------------
-- Signup: profile + default settings
-- ---------------------------------------------------------------------------

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  display_name text;
begin
  display_name := coalesce(
    new.raw_user_meta_data ->> 'name',
    new.raw_user_meta_data ->> 'full_name',
    split_part(coalesce(new.email, 'user'), '@', 1)
  );

  insert into public.profiles (id, email, name)
  values (new.id, coalesce(new.email, ''), display_name);

  insert into public.user_settings (user_id)
  values (new.id);

  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();
