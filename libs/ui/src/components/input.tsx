import type { TextInputProps } from 'react-native';
import { Text, TextInput, View } from '../lib/rn';
import { cn } from '../lib/cn';

type InputProps = TextInputProps & {
  label?: string;
  error?: string;
  className?: string;
  containerClassName?: string;
};

export function Input({
  label,
  error,
  className,
  containerClassName,
  ...props
}: InputProps) {
  return (
    <View className={cn('gap-1.5', containerClassName)}>
      {label ? (
        <Text className="font-sans text-sm font-medium text-fg">{label}</Text>
      ) : null}
      <TextInput
        placeholderTextColor="#94A3B8"
        className={cn(
          'h-12 rounded-xl border border-border bg-surface px-3 font-sans text-base text-fg',
          error && 'border-danger',
          className,
        )}
        {...props}
      />
      {error ? (
        <Text className="font-sans text-xs text-danger">{error}</Text>
      ) : null}
    </View>
  );
}
