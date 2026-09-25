import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import {
  catalogs,
  type Catalog,
  type Locale,
  type MessageKey,
} from './catalogs';

type I18nContextValue = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: MessageKey) => string;
  catalog: Catalog;
};

const I18nContext = createContext<I18nContextValue | null>(null);

type I18nProviderProps = {
  children: ReactNode;
  initialLocale?: Locale;
  onLocaleChange?: (locale: Locale) => void;
};

export function I18nProvider({
  children,
  initialLocale = 'ko',
  onLocaleChange,
}: I18nProviderProps) {
  const [locale, setLocaleState] = useState<Locale>(initialLocale);

  const setLocale = useCallback(
    (next: Locale) => {
      setLocaleState(next);
      onLocaleChange?.(next);
    },
    [onLocaleChange],
  );

  const catalog = catalogs[locale];

  const t = useCallback(
    (key: MessageKey) => catalog[key] ?? catalogs.ko[key] ?? key,
    [catalog],
  );

  const value = useMemo(
    () => ({ locale, setLocale, t, catalog }),
    [locale, setLocale, t, catalog],
  );

  return (
    <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
  );
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) {
    throw new Error('useI18n must be used within I18nProvider');
  }
  return ctx;
}
