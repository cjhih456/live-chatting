import { ActivityIndicator } from 'react-native';
import { Pressable, Text } from '../lib/rn';
import type { PressableProps } from 'react-native';
import { cn } from '../lib/cn';

type ButtonVariant =
  | 'primary'
  | 'secondary'
  | 'apple'
  | 'kakao'
  | 'danger'
  | 'ghost';

type ButtonProps = PressableProps & {
  label: string;
  variant?: ButtonVariant;
  loading?: boolean;
  className?: string;
};

const variantClass: Record<ButtonVariant, string> = {
  primary: 'bg-primary',
  secondary: 'border border-border bg-surface',
  apple: 'bg-[#111111]',
  kakao: 'bg-kakao',
  danger: 'bg-danger',
  ghost: 'bg-transparent',
};

const labelClass: Record<ButtonVariant, string> = {
  primary: 'text-on-primary',
  secondary: 'text-fg',
  apple: 'text-white',
  kakao: 'text-kakao-fg',
  danger: 'text-on-primary',
  ghost: 'text-primary',
};

const spinnerColor: Record<ButtonVariant, string> = {
  primary: '#FFFFFF',
  secondary: '#0F172A',
  apple: '#FFFFFF',
  kakao: '#191919',
  danger: '#FFFFFF',
  ghost: '#2563EB',
};

export function Button({
  label,
  variant = 'primary',
  loading,
  disabled,
  className,
  ...props
}: ButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled || loading}
      className={cn(
        'h-12 flex-row items-center justify-center rounded-xl px-4',
        variantClass[variant],
        (disabled || loading) && 'opacity-60',
        className,
      )}
      {...props}
    >
      {loading ? (
        <ActivityIndicator color={spinnerColor[variant]} />
      ) : (
        <Text
          className={cn(
            'font-sans text-base font-semibold',
            labelClass[variant],
          )}
        >
          {label}
        </Text>
      )}
    </Pressable>
  );
}
