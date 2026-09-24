import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { getSupabaseClient, useOAuthLoginMutation, useSupabaseDataSource } from '@lumen/data';
import { Text, View, Button } from '@lumen/ui';
import { useI18n } from '@lumen/i18n';
import type { OAuthProvider } from '@lumen/structure';

function BrandMark() {
  return <View className="h-10 w-10 rounded-xl bg-primary" />;
}

function SnsActions({
  loading,
  onSignIn,
}: {
  loading: boolean;
  onSignIn: (provider: OAuthProvider) => void;
}) {
  const { t } = useI18n();
  return (
    <View className="w-full gap-3">
      <Button
        label={t('continueGoogle')}
        variant="secondary"
        loading={loading}
        onPress={() => onSignIn('google')}
      />
      <Button
        label={t('continueApple')}
        variant="apple"
        loading={loading}
        onPress={() => onSignIn('apple')}
      />
      <Button
        label={t('continueKakao')}
        variant="kakao"
        loading={loading}
        onPress={() => onSignIn('kakao')}
      />
    </View>
  );
}

export default function LoginPage() {
  const router = useRouter();
  const { t } = useI18n();
  const [formError, setFormError] = useState<string | null>(null);
  const supabaseAuth = useSupabaseDataSource();
  const mutation = useOAuthLoginMutation({
    onSuccess: () => {
      if (!supabaseAuth) {
        router.push('/chats');
      }
    },
    onError: (error) => setFormError(error.message),
  });

  useEffect(() => {
    if (!supabaseAuth) {
      return;
    }
    const client = getSupabaseClient();
    if (!client) {
      return;
    }
    const { data } = client.auth.onAuthStateChange((event, session) => {
      if (session && (event === 'SIGNED_IN' || event === 'INITIAL_SESSION')) {
        void router.replace('/chats');
      }
    });
    return () => data.subscription.unsubscribe();
  }, [router, supabaseAuth]);

  const signIn = (provider: OAuthProvider) => {
    mutation.mutate({ provider });
  };

  return (
    <View className="min-h-screen flex-1 bg-bg md:flex-row">
      {/* PC · Brand Panel — design.pen `PC · SNS 로그인` */}
      <View className="hidden flex-1 justify-between bg-surface-2 px-12 py-14 md:flex">
        <View className="flex-row items-center gap-3">
          <BrandMark />
          <Text className="font-sans text-2xl font-bold text-fg">
            {t('appName')}
          </Text>
        </View>
        <View className="max-w-md gap-4">
          <Text className="font-sans text-4xl font-bold leading-tight text-fg">
            {t('loginPitch')}
          </Text>
          <Text className="font-sans text-base leading-6 text-muted">
            {t('loginPitchSub')}
          </Text>
        </View>
        <Text className="font-sans text-sm text-muted">{t('loginFoot')}</Text>
      </View>

      {/* Form Panel / Mobile body */}
      <View className="flex-1 items-center justify-center px-6 py-10 md:bg-surface md:px-12">
        <View className="w-full max-w-md gap-8">
          <View className="gap-3 md:hidden">
            <View className="flex-row items-center gap-3">
              <BrandMark />
              <Text className="font-sans text-2xl font-bold text-fg">
                {t('appName')}
              </Text>
            </View>
            <Text className="font-sans text-3xl font-bold leading-tight text-fg">
              {t('loginHeadline')}
            </Text>
            <Text className="font-sans text-base text-muted">
              {t('loginSubhead')}
            </Text>
          </View>

          <View className="hidden gap-2 md:flex">
            <Text className="font-sans text-3xl font-bold text-fg">
              {t('loginWebTitle')}
            </Text>
            <Text className="font-sans text-base text-muted">
              {t('loginWebSub')}
            </Text>
          </View>

          <SnsActions loading={mutation.isPending} onSignIn={signIn} />

          {formError ? (
            <Text className="font-sans text-sm text-danger">{formError}</Text>
          ) : null}

          <Text className="font-sans text-center text-xs leading-5 text-muted md:text-left">
            {t('loginLegal')}
          </Text>
        </View>
      </View>
    </View>
  );
}
