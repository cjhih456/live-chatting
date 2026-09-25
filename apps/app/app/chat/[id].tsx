import { Suspense } from 'react';
import { useLocalSearchParams } from 'expo-router';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ErrorBoundary } from 'react-error-boundary';
import {
  messageComposeSchema,
  type MessageComposeInput,
} from '@lumen/structure';
import { useMessagesQuery, useSendMessageMutation } from '@lumen/data';
import { FlatList, View, BubbleIn, BubbleOut, Button, ErrorState, Input, LoadingState } from '@lumen/ui';

function ChatContent({ conversationId }: { conversationId: string }) {
  const { data } = useMessagesQuery(conversationId);
  const mutation = useSendMessageMutation(conversationId);
  const { control, handleSubmit, reset } = useForm<MessageComposeInput>({
    resolver: zodResolver(messageComposeSchema),
    defaultValues: { body: '' },
  });

  return (
    <View className="flex-1 bg-bg">
      <FlatList
        className="flex-1 px-4 pt-3"
        data={data.items}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) =>
          item.senderId === 'user-inhwan' ? (
            <BubbleOut body={item.body} failed={item.failed} />
          ) : (
            <BubbleIn body={item.body} />
          )
        }
      />
      <View className="flex-row items-end gap-2 border-t border-border bg-surface p-3">
        <Controller
          control={control}
          name="body"
          render={({ field: { onChange, onBlur, value }, fieldState }) => (
            <Input
              containerClassName="flex-1"
              placeholder="메시지 입력"
              value={value}
              onBlur={onBlur}
              onChangeText={onChange}
              error={fieldState.error?.message}
            />
          )}
        />
        <Button
          label="전송"
          className="mb-0.5 w-20"
          loading={mutation.isPending}
          onPress={() => {
            void handleSubmit((values) =>
              mutation.mutate(values, { onSuccess: () => reset() }),
            )();
          }}
        />
      </View>
    </View>
  );
}

export default function ChatScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const conversationId = id
  console.log(conversationId)
  if(!conversationId) {
    return <div></div>
  }

  return (
    <ErrorBoundary
      fallbackRender={({ error, resetErrorBoundary }) => (
        <ErrorState message={error.message} onRetry={resetErrorBoundary} />
      )}
    >
      <Suspense fallback={<LoadingState />}>
        <ChatContent conversationId={conversationId} />
      </Suspense>
    </ErrorBoundary>
  );
}
