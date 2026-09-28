import { Text, View } from '../lib/rn';
import { cn } from '../lib/cn';

type BubbleProps = {
  body: string;
  timeLabel?: string;
  failed?: boolean;
  className?: string;
};

export function BubbleIn({ body, timeLabel, className }: BubbleProps) {
  return (
    <View className={cn('mb-2 max-w-[80%] self-start', className)}>
      <View className="rounded-2xl rounded-bl-md bg-surface-2 px-3 py-2">
        <Text className="font-sans text-base text-fg">{body}</Text>
      </View>
      {timeLabel ? (
        <Text className="mt-1 font-os text-xs text-muted">{timeLabel}</Text>
      ) : null}
    </View>
  );
}

export function BubbleOut({ body, timeLabel, failed, className }: BubbleProps) {
  return (
    <View className={cn('mb-2 max-w-[80%] self-end', className)}>
      <View
        className={cn(
          'rounded-2xl rounded-br-md px-3 py-2',
          failed ? 'bg-danger' : 'bg-primary',
        )}
      >
        <Text className="font-sans text-base text-on-primary">{body}</Text>
      </View>
      {timeLabel ? (
        <Text className="mt-1 self-end font-os text-xs text-muted">
          {failed ? '전송 실패 · ' : ''}
          {timeLabel}
        </Text>
      ) : null}
    </View>
  );
}
