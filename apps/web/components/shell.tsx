import { useRouter } from 'next/router';
import { copy } from '@lumen/structure';
import { cn, Pressable, Text, View } from '@lumen/ui';

type ShellProps = {
  active: 'chats' | 'friends' | 'settings';
  children: React.ReactNode;
};

const nav = [
  { id: 'chats' as const, label: copy.chats, href: '/chats' },
  { id: 'friends' as const, label: copy.friends, href: '/friends' },
  { id: 'settings' as const, label: copy.settings, href: '/settings' },
];

export function Shell({ active, children }: ShellProps) {
  const router = useRouter();

  return (
    <View className="min-h-screen flex-row bg-bg">
      <View className="w-[232px] shrink-0 border-r border-border bg-surface px-3 py-6">
        <Text className="mb-6 px-2 font-sans text-xl font-bold text-fg">
          {copy.appName}
        </Text>
        <View className="gap-1">
          {nav.map((item) => {
            const isActive = item.id === active;
            return (
              <Pressable
                key={item.id}
                onPress={() => router.push(item.href)}
                className={cn(
                  'rounded-xl px-3 py-3',
                  isActive ? 'bg-primary-soft' : 'bg-transparent',
                )}
              >
                <Text
                  className={cn(
                    'font-sans text-sm',
                    isActive ? 'font-semibold text-primary' : 'text-muted',
                  )}
                >
                  {item.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>
      <View className="min-w-0 flex-1">{children}</View>
    </View>
  );
}
