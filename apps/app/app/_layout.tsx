import '../global.css';
import { useEffect, useState } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import {
  useFonts,
  NotoSansKR_400Regular,
  NotoSansKR_700Bold,
} from '@expo-google-fonts/noto-sans-kr';
import {
  Inter_400Regular,
  Inter_600SemiBold,
} from '@expo-google-fonts/inter';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider, View, useTheme } from '@lumen/ui';
import { I18nProvider } from '@lumen/i18n';

SplashScreen.preventAutoHideAsync().catch(() => undefined);

function makeClient() {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: 1, staleTime: 30_000 },
    },
  });
}

function RootStack() {
  const { resolved } = useTheme();
  return (
    <>
      <StatusBar style={resolved === 'dark' ? 'light' : 'dark'} />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: {
            backgroundColor: resolved === 'dark' ? '#0B1220' : '#F4F7FB',
          },
        }}
      />
    </>
  );
}

export default function RootLayout() {
  const [client] = useState(makeClient);
  const [fontsLoaded] = useFonts({
    NotoSansKR: NotoSansKR_400Regular,
    NotoSansKR_400Regular,
    NotoSansKR_700Bold,
    Inter: Inter_400Regular,
    Inter_400Regular,
    Inter_600SemiBold,
  });

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync().catch(() => undefined);
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return <View className="flex-1 bg-bg" />;
  }

  return (
    <QueryClientProvider client={client}>
      <ThemeProvider initialTheme="system">
        <I18nProvider initialLocale="ko">
          <RootStack />
        </I18nProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
