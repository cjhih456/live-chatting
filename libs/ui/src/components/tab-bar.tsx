import { Pressable, Text, View } from '../lib/rn';
import { cn } from '../lib/cn';

type TabItem = {
  id: string;
  label: string;
};

type TabBarProps = {
  tabs: TabItem[];
  value: string;
  onChange: (id: string) => void;
  className?: string;
};

export function TabBar({ tabs, value, onChange, className }: TabBarProps) {
  return (
    <View
      className={cn(
        'flex-row border-t border-border bg-surface px-2 pb-safe pt-2',
        className,
      )}
    >
      {tabs.map((tab) => {
        const active = tab.id === value;
        return (
          <Pressable
            key={tab.id}
            onPress={() => onChange(tab.id)}
            className="flex-1 items-center py-2"
          >
            <Text
              className={cn(
                'font-sans text-sm',
                active ? 'font-semibold text-primary' : 'text-muted',
              )}
            >
              {tab.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
