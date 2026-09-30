import type { AppProps } from 'next/app';
import type { SetupWorker } from 'msw/browser';
import Head from 'next/head';
import { useEffect, useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { getSupabaseClient } from '@lumen/data';
import { ThemeProvider } from '@lumen/ui';
import { I18nProvider } from '@lumen/i18n';
import '../styles/globals.css';

function makeClient() {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: 1, staleTime: 30_000 },
    },
  });
}

export default function App({ Component, pageProps }: AppProps) {
  const [client] = useState(makeClient);
  const supabaseClient = useState(() => getSupabaseClient());

  useEffect(() => {
    if (supabaseClient !== null) {
      return;
    }
    if (process.env.NODE_ENV !== 'development') {
      return;
    }

    let cancelled = false;
    
    if (sessionStorage.getItem('lumen-msw-browser') === 'off') {
      return;
    }
    let worker: SetupWorker | null = null;

    void (async () => {
      try {
        const { startBrowserWorker } = await import('@lumen/data/msw/browser');
        if (!cancelled) {
          await startBrowserWorker();
        }
      } catch (error) {
        console.error('MSW worker failed to start', error);
      }
    })();

    return () => {
      cancelled = true;
      if (worker !== null) {
        void (async () => {
          try {
            const { stopBrowserWorker } = await import('@lumen/data/msw/browser');
            if (!cancelled) {
              await stopBrowserWorker(worker);
            }
          } catch (error) {
            console.error('MSW worker failed to start', error);
          }
        })();
      }

    };
  }, [supabaseClient]);

  return (
    <QueryClientProvider client={client}>
      <ThemeProvider initialTheme="system">
        <I18nProvider initialLocale="ko">
          <Head>
            <title>Lumen</title>
          </Head>
          <Component {...pageProps} />
        </I18nProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
