import type {
  AddFriendInput,
  ConversationFilter,
  MessageComposeInput,
  ProfileUpdateInput,
  UserSettingsUpdateInput,
} from '@lumen/structure';
import {
  conversationListSchema,
  friendListSchema,
  friendSchema,
  messageListSchema,
  messageSchema,
  profileSchema,
  userSettingsSchema,
} from '@lumen/structure';
import { getSupabaseClient } from './client';

type ProfileRow = {
  id: string;
  name: string;
  email: string;
  bio: string;
  avatar_url: string | null;
};

type ConversationRow = {
  id: string;
  title: string;
  is_group: boolean;
  avatar_url: string | null;
  updated_at: string;
};

type MessageRow = {
  id: string;
  conversation_id: string;
  sender_id: string;
  body: string;
  created_at: string;
  failed: boolean;
};

function requireClient() {
  const client = getSupabaseClient();
  if (!client) {
    throw new Error('Supabase is not configured');
  }
  return client;
}

async function requireUserId() {
  const client = requireClient();
  const {
    data: { user },
    error,
  } = await client.auth.getUser();
  if (error) {
    throw error;
  }
  if (!user) {
    throw new Error('Not authenticated');
  }
  return user.id;
}

function mapProfile(row: ProfileRow) {
  return profileSchema.parse({
    id: row.id,
    name: row.name,
    email: row.email,
    bio: row.bio,
    avatarUrl: row.avatar_url,
  });
}

function mapMessage(row: MessageRow) {
  return messageSchema.parse({
    id: row.id,
    conversationId: row.conversation_id,
    senderId: row.sender_id,
    body: row.body,
    createdAt: row.created_at,
    failed: row.failed || undefined,
  });
}

export const supabaseProfileRepository = {
  async get() {
    const client = requireClient();
    const { data, error } = await client
      .from('profiles')
      .select('id, name, email, bio, avatar_url')
      .single();
    if (error) {
      throw error;
    }
    return mapProfile(data as ProfileRow);
  },
  async update(input: ProfileUpdateInput) {
    const client = requireClient();
    const userId = await requireUserId();
    const { data, error } = await client
      .from('profiles')
      .update({
        name: input.name,
        bio: input.bio ?? '',
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId)
      .select('id, name, email, bio, avatar_url')
      .single();
    if (error) {
      throw error;
    }
    return mapProfile(data as ProfileRow);
  },
};

export const supabaseConversationRepository = {
  async list(filter: ConversationFilter = 'all') {
    const client = requireClient();
    const userId = await requireUserId();

    const { data: memberships, error: memberError } = await client
      .from('conversation_members')
      .select('conversation_id, unread_count, conversations(*)')
      .eq('user_id', userId);

    if (memberError) {
      throw memberError;
    }

    const rows = (memberships ?? []).flatMap((row) => {
      const nested = row.conversations as ConversationRow | ConversationRow[] | null;
      const conversation = Array.isArray(nested) ? nested[0] ?? null : nested;
      if (!conversation) {
        return [];
      }
      return [
        {
          conversation,
          unreadCount: row.unread_count as number,
        },
      ];
    });

    const conversationIds = rows.map((r) => r.conversation.id);
    const previewByConversation = new Map<string, string>();

    if (conversationIds.length > 0) {
      const { data: latestMessages, error: messagesError } = await client
        .from('messages')
        .select('conversation_id, body, created_at')
        .in('conversation_id', conversationIds)
        .order('created_at', { ascending: false });

      if (messagesError) {
        throw messagesError;
      }

      for (const message of latestMessages ?? []) {
        const cid = message.conversation_id as string;
        if (!previewByConversation.has(cid)) {
          previewByConversation.set(cid, message.body as string);
        }
      }
    }

    let items = rows.map(({ conversation, unreadCount }) => ({
      id: conversation.id,
      title: conversation.title,
      preview: previewByConversation.get(conversation.id) ?? '',
      updatedAt: conversation.updated_at,
      unreadCount,
      isGroup: conversation.is_group,
      avatarUrl: conversation.avatar_url,
    }));

    if (filter === 'unread') {
      items = items.filter((item) => item.unreadCount > 0);
    } else if (filter === 'group') {
      items = items.filter((item) => item.isGroup);
    }

    items.sort(
      (a, b) =>
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
    );

    return conversationListSchema.parse({ items });
  },

  async listMessages(conversationId: string) {
    const client = requireClient();
    const { data, error } = await client
      .from('messages')
      .select('id, conversation_id, sender_id, body, created_at, failed')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true });

    if (error) {
      throw error;
    }

    const items = (data as MessageRow[]).map(mapMessage);
    return messageListSchema.parse({ items });
  },

  async sendMessage(conversationId: string, input: MessageComposeInput) {
    const client = requireClient();
    const userId = await requireUserId();
    const { data, error } = await client
      .from('messages')
      .insert({
        conversation_id: conversationId,
        sender_id: userId,
        body: input.body,
      })
      .select('id, conversation_id, sender_id, body, created_at, failed')
      .single();

    if (error) {
      throw error;
    }

    await client
      .from('conversations')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', conversationId);

    return mapMessage(data as MessageRow);
  },
};

type SettingsRow = {
  theme: 'light' | 'dark' | 'system';
  locale: string;
  push_enabled: boolean;
  sound_enabled: boolean;
  preview_enabled: boolean;
};

function mapSettings(row: SettingsRow) {
  const locale =
    row.locale === 'ko' || row.locale === 'en' ? row.locale : 'ko';
  return userSettingsSchema.parse({
    theme: row.theme,
    locale,
    notificationsEnabled: row.push_enabled,
    soundEnabled: row.sound_enabled,
  });
}

export const supabaseSettingsRepository = {
  async get() {
    const client = requireClient();
    const userId = await requireUserId();
    const { data, error } = await client
      .from('user_settings')
      .select('theme, locale, push_enabled, sound_enabled, preview_enabled')
      .eq('user_id', userId)
      .single();
    if (error) {
      throw error;
    }
    return mapSettings(data as SettingsRow);
  },
  async update(input: UserSettingsUpdateInput) {
    const client = requireClient();
    const userId = await requireUserId();
    const patch: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };
    if (input.theme !== undefined) {
      patch.theme = input.theme;
    }
    if (input.locale !== undefined) {
      patch.locale = input.locale;
    }
    if (input.notificationsEnabled !== undefined) {
      patch.push_enabled = input.notificationsEnabled;
    }
    if (input.soundEnabled !== undefined) {
      patch.sound_enabled = input.soundEnabled;
    }
    const { data, error } = await client
      .from('user_settings')
      .update(patch)
      .eq('user_id', userId)
      .select('theme, locale, push_enabled, sound_enabled, preview_enabled')
      .single();
    if (error) {
      throw error;
    }
    return mapSettings(data as SettingsRow);
  },
};

export const supabaseFriendRepository = {
  async list() {
    const client = requireClient();
    const userId = await requireUserId();

    const { data: friendships, error } = await client
      .from('friendships')
      .select('user_id, friend_id')
      .or(`user_id.eq.${userId},friend_id.eq.${userId}`);

    if (error) {
      throw error;
    }

    const friendIds = (friendships ?? []).map((row) =>
      row.user_id === userId ? row.friend_id : row.user_id,
    );

    if (friendIds.length === 0) {
      return friendListSchema.parse({ items: [] });
    }

    const { data: profiles, error: profileError } = await client
      .from('profiles')
      .select('id, name, email, bio, avatar_url')
      .in('id', friendIds);

    if (profileError) {
      throw profileError;
    }

    const items = (profiles as ProfileRow[]).map((row) =>
      friendSchema.parse({
        id: row.id,
        name: row.name,
        email: row.email,
        avatarUrl: row.avatar_url,
        online: false,
      }),
    );

    return friendListSchema.parse({ items });
  },

  async add(input: AddFriendInput) {
    const client = requireClient();
    const userId = await requireUserId();

    const { data: friendRows, error: lookupError } = await client.rpc(
      'lookup_profile_by_email',
      { p_email: input.email },
    );
    const friendProfile = (friendRows as ProfileRow[] | null)?.[0] ?? null;

    if (lookupError) {
      throw lookupError;
    }
    if (!friendProfile) {
      throw new Error('해당 이메일의 사용자를 찾을 수 없습니다');
    }
    if (friendProfile.id === userId) {
      throw new Error('자기 자신은 친구로 추가할 수 없습니다');
    }

    const { error: insertError } = await client.from('friendships').insert({
      user_id: userId,
      friend_id: friendProfile.id,
    });

    if (insertError) {
      throw insertError;
    }

    return friendSchema.parse({
      id: friendProfile.id,
      name: friendProfile.name,
      email: friendProfile.email,
      avatarUrl: friendProfile.avatar_url,
      online: false,
    });
  },
};
