import { Text, View } from '../lib/rn';
import { Button } from './button';
import { cn } from '../lib/cn';

type ErrorStateProps = {
  message: string;
  onRetry?: () => void;
  className?: string;
};

export function ErrorState({ message, onRetry, className }: ErrorStateProps) {
  return (
    <View className={cn('flex-1 items-center justify-center gap-3 p-6', className)}>
      <Text className="text-center font-sans text-base text-fg">{message}</Text>
      {onRetry ? <Button label="다시 시도" onPress={onRetry} /> : null}
    </View>
  );
}

export function LoadingState({ className }: { className?: string }) {
  return (
    <View className={cn('flex-1 items-center justify-center bg-bg p-6', className)}>
      <Text className="font-sans text-muted">불러오는 중…</Text>
    </View>
  );
}

export function EmptyState({
  message,
  className,
}: {
  message: string;
  className?: string;
}) {
  return (
    <View className={cn('flex-1 items-center justify-center p-6', className)}>
      <Text className="text-center font-sans text-base text-muted">{message}</Text>
    </View>
  );
}
