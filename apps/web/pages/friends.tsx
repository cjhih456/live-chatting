import { Suspense } from 'react';
import { useRouter } from 'next/router';
import { ErrorBoundary } from 'react-error-boundary';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { addFriendSchema, copy, type AddFriendInput } from '@lumen/structure';
import { useAddFriendMutation, useFriendsQuery } from '@lumen/data';
import { Text, View, Avatar, Button, ErrorState, Input, LoadingState } from '@lumen/ui';
import { Shell } from '../components/shell';

function FriendsContent() {
  const { data } = useFriendsQuery();
  const router = useRouter();
  const mutation = useAddFriendMutation({
    onSuccess: () => undefined,
  });
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
              <Text className="font-sans text-sm text-muted">{item.email}</Text>
            </View>
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
