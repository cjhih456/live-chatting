-- Close the Data API surface on SECURITY DEFINER functions.

-- Signup trigger. Callers do not invoke this over RPC.
revoke all on function public.handle_new_user() from public, anon, authenticated;
grant execute on function public.handle_new_user() to supabase_auth_admin;

-- Membership checks belong in policies. conversation_members RLS already
-- limits rows to the current user, so these lookups do not need a definer.
drop policy if exists "conversations_select_member" on public.conversations;
drop policy if exists "messages_select_member" on public.messages;
drop policy if exists "messages_insert_member" on public.messages;

create policy "conversations_select_member"
  on public.conversations for select
  to authenticated
  using (
    exists (
      select 1
      from public.conversation_members cm
      where cm.conversation_id = conversations.id
        and cm.user_id = auth.uid()
    )
  );

create policy "messages_select_member"
  on public.messages for select
  to authenticated
  using (
    exists (
      select 1
      from public.conversation_members cm
      where cm.conversation_id = messages.conversation_id
        and cm.user_id = auth.uid()
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
      where cm.conversation_id = conversation_id
        and cm.user_id = auth.uid()
    )
  );

drop function if exists public.is_conversation_member(uuid);

-- Exact-email lookup stays available to signed-in users, but runs as the
-- caller. A transaction-local setting opens that one row through RLS.
drop function if exists public.lookup_profile_by_email(text);

create policy "profiles_select_email_lookup"
  on public.profiles for select
  to authenticated
  using (
    nullif(current_setting('app.lookup_email', true), '') is not null
    and email = current_setting('app.lookup_email', true)
  );

create function public.lookup_profile_by_email(p_email text)
returns table (
  id uuid,
  name text,
  email text,
  bio text,
  avatar_url text
)
language plpgsql
security invoker
set search_path = public
as $$
declare
  normalized_email text;
begin
  if auth.uid() is null then
    return;
  end if;

  normalized_email := nullif(btrim(p_email), '');
  if normalized_email is null then
    return;
  end if;

  perform set_config('app.lookup_email', normalized_email, true);

  return query
    select p.id, p.name, p.email, p.bio, p.avatar_url
    from public.profiles p
    where p.email = normalized_email
    limit 1;
end;
$$;

revoke all on function public.lookup_profile_by_email(text) from public, anon;
grant execute on function public.lookup_profile_by_email(text) to authenticated;
