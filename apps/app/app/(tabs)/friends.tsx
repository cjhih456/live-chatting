import { Suspense } from 'react';
import { useRouter } from 'expo-router';
import { ErrorBoundary } from 'react-error-boundary';
import { useFriendsQuery } from '@lumen/data';
import { FlatList, View, Avatar, Button, ErrorState, LoadingState } from '@lumen/ui';
import { Text } from 'react-native';
import { copy } from '@lumen/structure';

function FriendsContent() {
  const router = useRouter();
  const { data } = useFriendsQuery();

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
              <Text className="font-sans text-sm text-muted">{item.email}</Text>
            </View>
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
