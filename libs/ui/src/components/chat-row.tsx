import type { PressableProps } from 'react-native';
import { Pressable, Text, View } from '../lib/rn';
import { Avatar } from './avatar';
import { cn } from '../lib/cn';

type ChatRowProps = PressableProps & {
  title: string;
  preview: string;
  timeLabel?: string;
  unreadCount?: number;
  isGroup?: boolean;
  className?: string;
};

export function ChatRow({
  title,
  preview,
  timeLabel,
  unreadCount = 0,
  isGroup,
  className,
  ...props
}: ChatRowProps) {
  return (
    <Pressable
      className={cn(
        'flex-row items-center gap-3 border-b border-border bg-surface px-4 py-3',
        className,
      )}
      {...props}
    >
      <Avatar name={title} online={isGroup ? false : unreadCount > 0} />
      <View className="min-w-0 flex-1">
        <View className="flex-row items-center justify-between gap-2">
          <Text className="font-sans text-base font-semibold text-fg" numberOfLines={1}>
            {title}
          </Text>
          {timeLabel ? (
            <Text className="font-os text-xs text-muted">{timeLabel}</Text>
          ) : null}
        </View>
        <Text className="font-sans text-sm text-muted" numberOfLines={1}>
          {preview}
        </Text>
      </View>
      {unreadCount > 0 ? (
        <View className="min-w-5 items-center justify-center rounded-full bg-primary px-1.5 py-0.5">
          <Text className="font-os text-xs font-semibold text-on-primary">
            {unreadCount}
          </Text>
        </View>
      ) : null}
    </Pressable>
  );
}
