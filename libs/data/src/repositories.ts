import {
  addFriendSchema,
  authSessionSchema,
  conversationListSchema,
  friendListSchema,
  friendSchema,
  messageComposeSchema,
  messageListSchema,
  messageSchema,
  oauthLoginSchema,
  profileSchema,
  profileUpdateSchema,
  userSettingsSchema,
  userSettingsUpdateSchema,
  type AddFriendInput,
  type ConversationFilter,
  type MessageComposeInput,
  type OAuthLoginInput,
  type ProfileUpdateInput,
  type UserSettingsUpdateInput,
} from '@lumen/structure';
import { api } from './client';
import { useSupabaseDataSource } from './supabase/client';
import {
  supabaseConversationRepository,
  supabaseFriendRepository,
  supabaseProfileRepository,
  supabaseSettingsRepository,
} from './supabase/repositories';

export { getSupabaseClient, isSupabaseConfigured, useSupabaseDataSource } from './supabase/client';

export const authRepository = {
  async oauthLogin(input: OAuthLoginInput) {
    const body = oauthLoginSchema.parse(input);
    const data = await api.post('auth/oauth', { json: body }).json();
    return authSessionSchema.parse(data);
  },
};

export const profileRepository = {
  async get() {
    if (useSupabaseDataSource()) {
      return supabaseProfileRepository.get();
    }
    const data = await api.get('profile').json();
    return profileSchema.parse(data);
  },
  async update(input: ProfileUpdateInput) {
    if (useSupabaseDataSource()) {
      return supabaseProfileRepository.update(input);
    }
    const body = profileUpdateSchema.parse(input);
    const data = await api.patch('profile', { json: body }).json();
    return profileSchema.parse(data);
  },
};

export const conversationRepository = {
  async list(filter: ConversationFilter = 'all') {
    if (useSupabaseDataSource()) {
      return supabaseConversationRepository.list(filter);
    }
    const data = await api
      .get('conversations', { searchParams: { filter } })
      .json();
    return conversationListSchema.parse(data);
  },
  async listMessages(conversationId: string) {
    if (useSupabaseDataSource()) {
      return supabaseConversationRepository.listMessages(conversationId);
    }
    const data = await api
      .get(`conversations/${conversationId}/messages`)
      .json();
    return messageListSchema.parse(data);
  },
  async sendMessage(conversationId: string, input: MessageComposeInput) {
    if (useSupabaseDataSource()) {
      return supabaseConversationRepository.sendMessage(conversationId, input);
    }
    const body = messageComposeSchema.parse(input);
    const data = await api
      .post(`conversations/${conversationId}/messages`, { json: body })
      .json();
    return messageSchema.parse(data);
  },
  async sendMessageFail(conversationId: string, input: MessageComposeInput) {
    const body = messageComposeSchema.parse(input);
    const data = await api
      .post(`conversations/${conversationId}/messages/fail`, { json: body })
      .json();
    return data;
  },
};

export const settingsRepository = {
  async get() {
    if (useSupabaseDataSource()) {
      return supabaseSettingsRepository.get();
    }
    const data = await api.get('settings').json();
    return userSettingsSchema.parse(data);
  },
  async update(input: UserSettingsUpdateInput) {
    if (useSupabaseDataSource()) {
      return supabaseSettingsRepository.update(input);
    }
    const body = userSettingsUpdateSchema.parse(input);
    const data = await api.patch('settings', { json: body }).json();
    return userSettingsSchema.parse(data);
  },
};

export const friendRepository = {
  async list() {
    if (useSupabaseDataSource()) {
      return supabaseFriendRepository.list();
    }
    const data = await api.get('friends').json();
    return friendListSchema.parse(data);
  },
  async add(input: AddFriendInput) {
    if (useSupabaseDataSource()) {
      return supabaseFriendRepository.add(input);
    }
    const body = addFriendSchema.parse(input);
    const data = await api.post('friends', { json: body }).json();
    return friendSchema.parse(data);
  },
};
