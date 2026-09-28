import { useState } from 'react';
import { useRouter } from 'expo-router';
import { useOAuthLoginMutation } from '@lumen/data';
import { Text, View, Button } from '@lumen/ui';
import { useI18n } from '@lumen/i18n';
import type { OAuthProvider } from '@lumen/structure';

export default function LoginScreen() {
  const router = useRouter();
  const { t } = useI18n();
  const [formError, setFormError] = useState<string | null>(null);
  const mutation = useOAuthLoginMutation({
    onSuccess: () => router.replace('/(tabs)/chats'),
    onError: (error) => setFormError(error.message),
  });

  const signIn = (provider: OAuthProvider) => {
    mutation.mutate({ provider });
  };

  return (
    <View className="flex-1 justify-center gap-8 bg-bg px-6">
      <View className="gap-3">
        <View className="flex-row items-center gap-3">
          <View className="h-10 w-10 rounded-xl bg-primary" />
          <Text className="font-sans text-2xl font-bold text-fg">
            {t('appName')}
          </Text>
        </View>
        <Text className="font-sans text-3xl font-bold leading-tight text-fg">
          {t('loginHeadline')}
        </Text>
        <Text className="font-sans text-base text-muted">{t('loginSubhead')}</Text>
      </View>

      <View className="gap-3">
        <Button
          label={t('continueGoogle')}
          variant="secondary"
          loading={mutation.isPending}
          onPress={() => signIn('google')}
        />
        <Button
          label={t('continueApple')}
          variant="apple"
          loading={mutation.isPending}
          onPress={() => signIn('apple')}
        />
        <Button
          label={t('continueKakao')}
          variant="kakao"
          loading={mutation.isPending}
          onPress={() => signIn('kakao')}
        />
      </View>

      {formError ? (
        <Text className="font-sans text-sm text-danger">{formError}</Text>
      ) : null}

      <Text className="font-sans text-center text-xs leading-5 text-muted">
        {t('loginLegal')}
      </Text>
    </View>
  );
}
