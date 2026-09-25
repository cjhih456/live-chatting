import { useRouter } from 'expo-router';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { addFriendSchema, type AddFriendInput } from '@lumen/structure';
import { useAddFriendMutation } from '@lumen/data';
import { View, Button, Input } from '@lumen/ui';

export default function AddFriendScreen() {
  const router = useRouter();
  const mutation = useAddFriendMutation({
    onSuccess: () => router.back(),
  });
  const { control, handleSubmit } = useForm<AddFriendInput>({
    resolver: zodResolver(addFriendSchema),
    defaultValues: { email: '' },
  });

  return (
    <View className="flex-1 gap-4 bg-bg p-6">
      <Controller
        control={control}
        name="email"
        render={({ field: { onChange, onBlur, value }, fieldState }) => (
          <Input
            label="친구 이메일"
            autoCapitalize="none"
            keyboardType="email-address"
            value={value}
            onBlur={onBlur}
            onChangeText={onChange}
            error={fieldState.error?.message}
          />
        )}
      />
      <Button
        label="친구 추가"
        loading={mutation.isPending}
        onPress={() => {
          void handleSubmit((values) => mutation.mutate(values))();
        }}
      />
    </View>
  );
}
