import { useRouter } from 'expo-router';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  profileUpdateSchema,
  type ProfileUpdateInput,
} from '@lumen/structure';
import { useUpdateProfileMutation } from '@lumen/data';
import { View, Button, Input } from '@lumen/ui';

export default function ProfileEditScreen() {
  const router = useRouter();
  const mutation = useUpdateProfileMutation({
    onSuccess: () => router.back(),
  });
  const { control, handleSubmit } = useForm<ProfileUpdateInput>({
    resolver: zodResolver(profileUpdateSchema),
    defaultValues: { name: '최인환', bio: 'Lumen에서 대화해요' },
  });

  return (
    <View className="flex-1 gap-4 bg-bg p-6">
      <Controller
        control={control}
        name="name"
        render={({ field: { onChange, onBlur, value }, fieldState }) => (
          <Input
            label="이름"
            value={value}
            onBlur={onBlur}
            onChangeText={onChange}
            error={fieldState.error?.message}
          />
        )}
      />
      <Controller
        control={control}
        name="bio"
        render={({ field: { onChange, onBlur, value }, fieldState }) => (
          <Input
            label="소개"
            value={value}
            onBlur={onBlur}
            onChangeText={onChange}
            error={fieldState.error?.message}
          />
        )}
      />
      <Button
        label="저장"
        loading={mutation.isPending}
        onPress={() => {
          void handleSubmit((values) => mutation.mutate(values))();
        }}
      />
    </View>
  );
}
