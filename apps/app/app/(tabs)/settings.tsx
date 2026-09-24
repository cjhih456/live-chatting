import { Suspense, useCallback, useEffect } from 'react';
import { useRouter } from 'expo-router';
import { ErrorBoundary } from 'react-error-boundary';
import {
  useProfileQuery,
  useSettingsQuery,
  useUpdateSettingsMutation,
} from '@lumen/data';
import {
  Text,
  View,
  Avatar,
  Button,
  ErrorState,
  LoadingState,
  FilterChips,
  useTheme,
  type ThemeMode,
} from '@lumen/ui';
import { useI18n, localeLabels, locales, type Locale } from '@lumen/i18n';

function SettingsContent() {
  const router = useRouter();
  const { t, locale, setLocale } = useI18n();
  const { theme, setTheme } = useTheme();
  const { data } = useProfileQuery();
  const { data: settings } = useSettingsQuery();
  const settingsMutation = useUpdateSettingsMutation();

  useEffect(() => {
    if (settings.theme !== theme) {
      setTheme(settings.theme);
    }
    if (settings.locale !== locale) {
      setLocale(settings.locale);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const persistSettings = useCallback(
    (patch: Partial<typeof settings>) => {
      settingsMutation.mutate({ ...settings, ...patch });
    },
    [settings, settingsMutation],
  );

  return (
    <View className="flex-1 gap-4 bg-bg p-6">
      <Text className="font-sans text-2xl font-bold text-fg">{t('settings')}</Text>

      <View className="items-center gap-3 rounded-2xl bg-surface p-6">
        <Avatar name={data.name} size="lg" />
        <Text className="font-sans text-xl font-bold text-fg">{data.name}</Text>
        <Text className="font-sans text-sm text-muted">{data.email}</Text>
        <Text className="font-sans text-sm text-muted">{data.bio}</Text>
      </View>

      <Button
        label={t('editProfile')}
        onPress={() => router.push('/profile-edit')}
      />

      <View className="gap-2">
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

      <View className="gap-2">
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

      <View className="gap-2">
        <Text className="font-sans text-sm font-semibold text-fg">
          {t('snsLink')}
        </Text>
        {(['Google', 'Apple', 'Kakao'] as const).map((provider) => (
          <View
            key={provider}
            className="flex-row items-center justify-between rounded-xl bg-surface px-4 py-3"
          >
            <Text className="font-sans text-sm text-fg">{provider}</Text>
            <Text className="font-sans text-sm text-muted">{t('connect')}</Text>
          </View>
        ))}
      </View>

      <Button
        label={t('logout')}
        variant="secondary"
        onPress={() => router.replace('/login')}
      />
    </View>
  );
}

export default function SettingsScreen() {
  return (
    <ErrorBoundary
      fallbackRender={({ error, resetErrorBoundary }) => (
        <ErrorState message={error.message} onRetry={resetErrorBoundary} />
      )}
    >
      <Suspense fallback={<LoadingState />}>
        <SettingsContent />
      </Suspense>
    </ErrorBoundary>
  );
}
