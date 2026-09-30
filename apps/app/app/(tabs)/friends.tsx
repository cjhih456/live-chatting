import { Suspense } from 'react';
import { useRouter } from 'expo-router';
import { ErrorBoundary } from 'react-error-boundary';
import { useAcceptFriendMutation, useFriendsQuery, useRemoveFriendMutation } from '@lumen/data';
import { FlatList, View, Avatar, Button, ErrorState, LoadingState } from '@lumen/ui';
import { Text } from 'react-native';
import { copy } from '@lumen/structure';

function FriendsContent() {
  const router = useRouter();
  const { data } = useFriendsQuery();
  const acceptFriend = useAcceptFriendMutation();
  const removeFriend = useRemoveFriendMutation();

  return (
    <View className="flex-1 bg-bg">
      <View className="px-4 py-3">
        <Button label={copy.addFriend} onPress={() => router.push('/add-friend')} />
      </View>
      <FlatList
        data={data.items}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View className="flex-row items-center gap-3 border-b border-border bg-surface px-4 py-3">
            <Avatar name={item.name} online={item.online} />
            <View className="flex-1">
              <Text className="font-sans text-base font-semibold text-fg">{item.name}</Text>
              <Text className="font-sans text-sm text-muted">
                {item.status === 'pending_in'
                  ? '친구 요청'
                  : item.status === 'pending_out'
                    ? '수락 대기'
                    : item.email}
              </Text>
            </View>
            {item.status === 'pending_in' ? (
              <Button label="수락" onPress={() => acceptFriend.mutate(item.id)} />
            ) : null}
            {item.status === 'pending_in' || item.status === 'pending_out' ? (
              <Button
                label={item.status === 'pending_in' ? '거절' : '취소'}
                variant="ghost"
                onPress={() => removeFriend.mutate(item.id)}
              />
            ) : null}
          </View>
        )}
      />
    </View>
  );
}

export default function FriendsScreen() {
  return (
    <ErrorBoundary
      fallbackRender={({ error, resetErrorBoundary }) => (
        <ErrorState message={error.message} onRetry={resetErrorBoundary} />
      )}
    >
      <Suspense fallback={<LoadingState />}>
        <FriendsContent />
      </Suspense>
    </ErrorBoundary>
  );
}
