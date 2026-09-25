import { Suspense, useState } from 'react';
import { useRouter } from 'expo-router';
import { ErrorBoundary } from 'react-error-boundary';
import { copy, type ConversationFilter } from '@lumen/structure';
import { useConversationsQuery } from '@lumen/data';
import { FlatList, View, ChatRow, EmptyState, ErrorState, FilterChips, LoadingState } from '@lumen/ui';

function ChatsContent() {
  const router = useRouter();
  const [filter, setFilter] = useState<ConversationFilter>('all');
  const { data } = useConversationsQuery(filter);

  return (
    <View className="flex-1 bg-bg">
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
      <FlatList
        data={data.items}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={<EmptyState message={copy.emptyChats} />}
        renderItem={({ item }) => (
          <ChatRow
            title={item.title}
            preview={item.preview}
            unreadCount={item.unreadCount}
            isGroup={item.isGroup}
            onPress={() => router.push(`/chat/${item.id}`)}
          />
        )}
      />
    </View>
  );
}

export default function ChatsScreen() {
  return (
    <ErrorBoundary
      fallbackRender={({ error, resetErrorBoundary }) => (
        <ErrorState message={error.message} onRetry={resetErrorBoundary} />
      )}
    >
      <Suspense fallback={<LoadingState />}>
        <ChatsContent />
      </Suspense>
    </ErrorBoundary>
  );
}
