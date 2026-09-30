import { Suspense } from 'react';
import { useRouter } from 'next/router';
import { ErrorBoundary } from 'react-error-boundary';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { addFriendSchema, copy, type AddFriendInput } from '@lumen/structure';
import { useAddFriendMutation, useAcceptFriendMutation, useFriendsQuery, useRemoveFriendMutation } from '@lumen/data';
import { Text, View, Avatar, Button, ErrorState, Input, LoadingState } from '@lumen/ui';
import { Shell } from '../components/shell';

function FriendsContent() {
  const { data } = useFriendsQuery();
  const router = useRouter();
  const mutation = useAddFriendMutation({
    onSuccess: () => undefined,
  });
  const acceptFriend = useAcceptFriendMutation();
  const removeFriend = useRemoveFriendMutation();
  const { control, handleSubmit, reset } = useForm<AddFriendInput>({
    resolver: zodResolver(addFriendSchema),
    defaultValues: { email: '' },
  });

  return (
    <View className="flex-1 gap-4 p-6">
      <Text className="font-sans text-2xl font-bold text-fg">{copy.friends}</Text>
      <View className="max-w-md flex-row items-end gap-2">
        <Controller
          control={control}
          name="email"
          render={({ field: { onChange, onBlur, value }, fieldState }) => (
            <Input
              containerClassName="flex-1"
              label="친구 이메일"
              value={value}
              onBlur={onBlur}
              onChangeText={onChange}
              error={fieldState.error?.message}
            />
          )}
        />
        <Button
          label={copy.addFriend}
          loading={mutation.isPending}
          onPress={() => {
            void handleSubmit((values) =>
              mutation.mutate(values, { onSuccess: () => reset() }),
            )();
          }}
        />
      </View>
      <View className="overflow-hidden rounded-2xl border border-border bg-surface">
        {data.items.map((item) => (
          <View
            key={item.id}
            className="flex-row items-center gap-3 border-b border-border px-4 py-3"
          >
            <Avatar name={item.name} online={item.online} />
            <View className="flex-1">
              <Text className="font-sans text-base font-semibold text-fg">
                {item.name}
              </Text>
              <Text className="font-sans text-sm text-muted">
                {item.status === 'pending_in'
                  ? '친구 요청'
                  : item.status === 'pending_out'
                    ? '수락 대기'
                    : item.email}
              </Text>
            </View>
            {item.status === 'pending_in' ? (
              <Button
                label="수락"
                loading={acceptFriend.isPending}
                onPress={() => acceptFriend.mutate(item.id)}
              />
            ) : null}
            {item.status === 'pending_in' || item.status === 'pending_out' ? (
              <Button
                label={item.status === 'pending_in' ? '거절' : '취소'}
                variant="ghost"
                loading={removeFriend.isPending}
                onPress={() => removeFriend.mutate(item.id)}
              />
            ) : null}
          </View>
        ))}
      </View>
      <Button
        label="채팅으로"
        variant="ghost"
        onPress={() => router.push('/chats')}
      />
    </View>
  );
}

export default function FriendsPage() {
  return (
    <Shell active="friends">
      <ErrorBoundary
        fallbackRender={({ error, resetErrorBoundary }) => (
          <ErrorState message={error.message} onRetry={resetErrorBoundary} />
        )}
      >
        <Suspense fallback={<LoadingState />}>
          <FriendsContent />
        </Suspense>
      </ErrorBoundary>
    </Shell>
  );
}

export async function getServerSideProps() {
  return { props: {} };
}
