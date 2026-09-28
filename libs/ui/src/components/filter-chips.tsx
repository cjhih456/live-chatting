import { Pressable, Text, View } from '../lib/rn';
import { cn } from '../lib/cn';

type Chip = { id: string; label: string };

type FilterChipsProps = {
  chips: Chip[];
  value: string;
  onChange: (id: string) => void;
  className?: string;
};

export function FilterChips({ chips, value, onChange, className }: FilterChipsProps) {
  return (
    <View className={cn('flex-row flex-wrap gap-2', className)}>
      {chips.map((chip) => {
        const active = chip.id === value;
        return (
          <Pressable
            key={chip.id}
            accessibilityRole="button"
            accessibilityLabel={chip.label}
            onPress={() => onChange(chip.id)}
            className={cn(
              'rounded-full border px-3 py-1.5',
              active
                ? 'border-primary bg-primary-soft'
                : 'border-border bg-surface',
            )}
          >
            <Text
              className={cn(
                'font-sans text-sm',
                active ? 'font-semibold text-primary' : 'text-muted',
              )}
            >
              {chip.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
