import { Suspense, useState } from 'react';
import { useRouter } from 'next/router';
import { ErrorBoundary } from 'react-error-boundary';
import { copy, type ConversationFilter } from '@lumen/structure';
import { useConversationsQuery, useMessagesQuery, useSendMessageMutation } from '@lumen/data';
import { Pressable, Text, View, BubbleIn, BubbleOut, Button, ChatRow, EmptyState, ErrorState, FilterChips, Input, LoadingState } from '@lumen/ui';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  messageComposeSchema,
  type MessageComposeInput,
} from '@lumen/structure';
import { Shell } from '../components/shell';

function Inbox({
  filter,
  selectedId,
  onSelect,
}: {
  filter: ConversationFilter;
  selectedId: string | null;
  onSelect: (id: string) => void;
}) {
  const { data } = useConversationsQuery(filter);
  if (data.items.length === 0) {
    return <EmptyState message={copy.emptyChats} />;
  }
  return (
    <View>
      {data.items.map((item) => (
        <ChatRow
          key={item.id}
          title={item.title}
          preview={item.preview}
          unreadCount={item.unreadCount}
          isGroup={item.isGroup}
          className={selectedId === item.id ? 'bg-primary-soft' : undefined}
          onPress={() => onSelect(item.id)}
        />
      ))}
    </View>
  );
}

function Thread({ conversationId }: { conversationId: string }) {
  const { data } = useMessagesQuery(conversationId);
  const mutation = useSendMessageMutation(conversationId);
  const { control, handleSubmit, reset } = useForm<MessageComposeInput>({
    resolver: zodResolver(messageComposeSchema),
    defaultValues: { body: '' },
  });

  return (
    <View className="flex-1">
      <View className="flex-1 gap-1 p-4">
        {data.items.map((item) =>
          item.senderId === 'user-inhwan' ? (
            <BubbleOut key={item.id} body={item.body} failed={item.failed} />
          ) : (
            <BubbleIn key={item.id} body={item.body} />
          ),
        )}
      </View>
      <View className="flex-row items-end gap-2 border-t border-border p-3">
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
          className="w-20"
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

export default function ChatsPage() {
  const [filter, setFilter] = useState<ConversationFilter>('all');
  const [selectedId, setSelectedId] = useState<string | null>(null);

  return (
    <Shell active="chats">
      <View className="min-h-screen flex-1 flex-row bg-bg">
        <View className="w-80 border-r border-border bg-surface">
          <FilterChips
            className="px-4 py-3"
            value={filter}
            onChange={(id) => setFilter(id as ConversationFilter)}
            chips={[
              { id: 'all', label: copy.filterAll },
              { id: 'unread', label: copy.filterUnread },
              { id: 'group', label: copy.filterGroup },
            ]}
          />
          <ErrorBoundary
            fallbackRender={({ error, resetErrorBoundary }) => (
              <ErrorState message={error.message} onRetry={resetErrorBoundary} />
            )}
          >
            <Suspense fallback={<LoadingState />}>
              <Inbox
                filter={filter}
                selectedId={selectedId}
                onSelect={setSelectedId}
              />
            </Suspense>
          </ErrorBoundary>
        </View>
        <View className="flex-1 bg-bg">
          {selectedId ? (
            <ErrorBoundary
              fallbackRender={({ error, resetErrorBoundary }) => (
                <ErrorState
                  message={error.message}
                  onRetry={resetErrorBoundary}
                />
              )}
            >
              <Suspense fallback={<LoadingState />}>
                <Thread conversationId={selectedId} />
              </Suspense>
            </ErrorBoundary>
          ) : (
            <EmptyState message="대화를 선택하세요" />
          )}
        </View>
      </View>
    </Shell>
  );
}

export async function getServerSideProps() {
  return { props: {} };
}
