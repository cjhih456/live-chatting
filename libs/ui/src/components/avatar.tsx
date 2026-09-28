import { Text, View } from '../lib/rn';
import { cn } from '../lib/cn';

type AvatarProps = {
  name: string;
  size?: 'sm' | 'md' | 'lg';
  online?: boolean;
  className?: string;
};

const sizeMap = {
  sm: 'h-8 w-8',
  md: 'h-10 w-10',
  lg: 'h-14 w-14',
} as const;

const textSizeMap = {
  sm: 'text-xs',
  md: 'text-sm',
  lg: 'text-lg',
} as const;

export function Avatar({
  name,
  size = 'md',
  online,
  className,
}: AvatarProps) {
  const initial = name.trim().charAt(0) || '?';
  return (
    <View className={cn('relative', className)}>
      <View
        className={cn(
          'items-center justify-center rounded-full bg-primary-soft',
          sizeMap[size],
        )}
      >
        <Text
          className={cn(
            'font-sans font-semibold text-primary',
            textSizeMap[size],
          )}
        >
          {initial}
        </Text>
      </View>
      {online ? (
        <View className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-surface bg-online" />
      ) : null}
    </View>
  );
}
