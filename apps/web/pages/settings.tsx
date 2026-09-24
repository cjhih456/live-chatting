import { Suspense, useCallback, useEffect } from 'react';
import { useRouter } from 'next/router';
import { ErrorBoundary } from 'react-error-boundary';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  profileUpdateSchema,
  type ProfileUpdateInput,
} from '@lumen/structure';
import {
  useProfileQuery,
  useUpdateProfileMutation,
  useSettingsQuery,
  useUpdateSettingsMutation,
} from '@lumen/data';
import {
  Text,
  View,
  Avatar,
  Button,
  ErrorState,
  Input,
  LoadingState,
  FilterChips,
  useTheme,
  type ThemeMode,
} from '@lumen/ui';
import { useI18n, localeLabels, locales, type Locale } from '@lumen/i18n';
import { Shell } from '../components/shell';

function SettingsContent() {
  const router = useRouter();
  const { t, locale, setLocale } = useI18n();
  const { theme, setTheme } = useTheme();
  const { data } = useProfileQuery();
  const { data: settings } = useSettingsQuery();
  const profileMutation = useUpdateProfileMutation();
  const settingsMutation = useUpdateSettingsMutation();
  const { control, handleSubmit } = useForm<ProfileUpdateInput>({
    resolver: zodResolver(profileUpdateSchema),
    defaultValues: { name: data.name, bio: data.bio },
  });

  useEffect(() => {
    if (settings.theme !== theme) {
      setTheme(settings.theme);
    }
    if (settings.locale !== locale) {
      setLocale(settings.locale);
    }
    // Sync once from persisted settings on mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const persistSettings = useCallback(
    (patch: Partial<typeof settings>) => {
      settingsMutation.mutate({ ...settings, ...patch });
    },
    [settings, settingsMutation],
  );

  return (
    <View className="flex-1 gap-4 p-6">
      <Text className="font-sans text-2xl font-bold text-fg">{t('settings')}</Text>

      <View className="max-w-md items-center gap-3 rounded-2xl border border-border bg-surface p-6">
        <Avatar name={data.name} size="lg" />
        <Text className="font-sans text-xl font-bold text-fg">{data.name}</Text>
        <Text className="font-sans text-sm text-muted">{data.email}</Text>
      </View>

      <View className="max-w-md gap-3">
        <Controller
          control={control}
          name="name"
          render={({ field: { onChange, onBlur, value }, fieldState }) => (
            <Input
              label={t('name')}
              accessibilityLabel={t('name')}
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
              label={t('bio')}
              accessibilityLabel={t('bio')}
              value={value}
              onBlur={onBlur}
              onChangeText={onChange}
              error={fieldState.error?.message}
            />
          )}
        />
        <Button
          label={t('save')}
          loading={profileMutation.isPending}
          onPress={() => {
            void handleSubmit((values) => profileMutation.mutate(values))();
          }}
        />
      </View>

      <View className="max-w-md gap-2">
        <Text className="font-sans text-sm font-semibold text-fg">
          {t('language')}
        </Text>
        <FilterChips
          chips={locales.map((id) => ({ id, label: localeLabels[id] }))}
          value={locale}
          onChange={(id) => {
            const next = id as Locale;
            setLocale(next);
            persistSettings({ locale: next });
          }}
        />
      </View>

      <View className="max-w-md gap-2">
        <Text className="font-sans text-sm font-semibold text-fg">
          {t('theme')}
        </Text>
        <FilterChips
          chips={[
            { id: 'light', label: t('themeLight') },
            { id: 'dark', label: t('themeDark') },
            { id: 'system', label: t('themeSystem') },
          ]}
          value={theme}
          onChange={(id) => {
            const next = id as ThemeMode;
            setTheme(next);
            persistSettings({ theme: next });
          }}
        />
      </View>

      <View className="max-w-md gap-2">
        <Text className="font-sans text-sm font-semibold text-fg">
          {t('snsLink')}
        </Text>
        {(['Google', 'Apple', 'Kakao'] as const).map((provider) => (
          <View
            key={provider}
            className="flex-row items-center justify-between rounded-xl border border-border bg-surface px-4 py-3"
          >
            <Text className="font-sans text-sm text-fg">{provider}</Text>
            <Text className="font-sans text-sm text-muted">{t('connect')}</Text>
          </View>
        ))}
      </View>

      <View className="max-w-md">
        <Button
          label={t('logout')}
          variant="secondary"
          onPress={() => router.push('/login')}
        />
      </View>
    </View>
  );
}

export default function SettingsPage() {
  return (
    <Shell active="settings">
      <ErrorBoundary
        fallbackRender={({ error, resetErrorBoundary }) => (
          <ErrorState message={error.message} onRetry={resetErrorBoundary} />
        )}
      >
        <Suspense fallback={<LoadingState />}>
          <SettingsContent />
        </Suspense>
      </ErrorBoundary>
    </Shell>
  );
}

export async function getServerSideProps() {
  return { props: {} };
}
