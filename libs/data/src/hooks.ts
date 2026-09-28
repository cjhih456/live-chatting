import {
  useMutation,
  useQueryClient,
  useSuspenseQuery,
  type UseMutationOptions,
} from '@tanstack/react-query';
import { useEffect } from 'react';
import type {
  AddFriendInput,
  ConversationFilter,
  MessageComposeInput,
  OAuthLoginInput,
  ProfileUpdateInput,
  UserSettingsUpdateInput,
} from '@lumen/structure';
import {
  authRepository,
  conversationRepository,
  friendRepository,
  profileRepository,
  settingsRepository,
  useSupabaseDataSource,
} from './repositories';
import { subscribeMessages } from './supabase/realtime';

export const queryKeys = {
  profile: ['profile'] as const,
  conversations: (filter: ConversationFilter) =>
    ['conversations', filter] as const,
  messages: (conversationId: string) =>
    ['messages', conversationId] as const,
  friends: ['friends'] as const,
  settings: ['settings'] as const,
};

export function useProfileQuery() {
  return useSuspenseQuery({
    queryKey: queryKeys.profile,
    queryFn: () => profileRepository.get(),
  });
}

export function useConversationsQuery(filter: ConversationFilter = 'all') {
  return useSuspenseQuery({
    queryKey: queryKeys.conversations(filter),
    queryFn: () => conversationRepository.list(filter),
  });
}

export function useMessagesQuery(conversationId: string) {
  return useSuspenseQuery({
    queryKey: queryKeys.messages(conversationId),
    queryFn: () => conversationRepository.listMessages(conversationId),
  });
}

export function useMessagesRealtime(conversationId: string) {
  const queryClient = useQueryClient();
  const enabled = useSupabaseDataSource();

  useEffect(() => {
    if (!enabled || !conversationId) {
      return;
    }

    return subscribeMessages(conversationId, () => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.messages(conversationId),
      });
    });
  }, [conversationId, enabled, queryClient]);
}

export function useFriendsQuery() {
  return useSuspenseQuery({
    queryKey: queryKeys.friends,
    queryFn: () => friendRepository.list(),
  });
}

export function useSettingsQuery() {
  return useSuspenseQuery({
    queryKey: queryKeys.settings,
    queryFn: () => settingsRepository.get(),
  });
}

export function useOAuthLoginMutation(
  options?: UseMutationOptions<
    Awaited<ReturnType<typeof authRepository.oauthLogin>>,
    Error,
    OAuthLoginInput
  >,
) {
  return useMutation({
    mutationFn: authRepository.oauthLogin,
    ...options,
  });
}

export function useUpdateProfileMutation(
  options?: UseMutationOptions<
    Awaited<ReturnType<typeof profileRepository.update>>,
    Error,
    ProfileUpdateInput
  >,
) {
  const queryClient = useQueryClient();
  const { onSuccess, ...rest } = options ?? {};
  return useMutation({
    mutationFn: profileRepository.update,
    ...rest,
    onSuccess: (data, variables, onMutateResult, context) => {
      queryClient.setQueryData(queryKeys.profile, data);
      return onSuccess?.(data, variables, onMutateResult, context);
    },
  });
}

export function useUpdateSettingsMutation(
  options?: UseMutationOptions<
    Awaited<ReturnType<typeof settingsRepository.update>>,
    Error,
    UserSettingsUpdateInput
  >,
) {
  const queryClient = useQueryClient();
  const { onSuccess, ...rest } = options ?? {};
  return useMutation({
    mutationFn: settingsRepository.update,
    ...rest,
    onSuccess: (data, variables, onMutateResult, context) => {
      queryClient.setQueryData(queryKeys.settings, data);
      return onSuccess?.(data, variables, onMutateResult, context);
    },
  });
}

export function useSendMessageMutation(
  conversationId: string,
  options?: UseMutationOptions<
    Awaited<ReturnType<typeof conversationRepository.sendMessage>>,
    Error,
    MessageComposeInput
  >,
) {
  return useMutation({
    mutationFn: (input: MessageComposeInput) =>
      conversationRepository.sendMessage(conversationId, input),
    ...options,
  });
}

export function useAddFriendMutation(
  options?: UseMutationOptions<
    Awaited<ReturnType<typeof friendRepository.add>>,
    Error,
    AddFriendInput
  >,
) {
  return useMutation({
    mutationFn: friendRepository.add,
    ...options,
  });
}
