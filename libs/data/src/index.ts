export { api, API_PREFIX } from './client';
export {
  authRepository,
  conversationRepository,
  friendRepository,
  getSupabaseClient,
  isSupabaseConfigured,
  profileRepository,
  settingsRepository,
  useSupabaseDataSource,
} from './repositories';
export { signInWithOAuth } from './supabase/auth';
export type { OAuthProvider } from '@lumen/structure';
export { subscribeMessages, type MessageChangePayload } from './supabase/realtime';
export {
  queryKeys,
  useAddFriendMutation,
  useConversationsQuery,
  useFriendsQuery,
  useMessagesQuery,
  useMessagesRealtime,
  useOAuthLoginMutation,
  useProfileQuery,
  useSendMessageMutation,
  useSettingsQuery,
  useUpdateProfileMutation,
  useUpdateSettingsMutation,
} from './hooks';
