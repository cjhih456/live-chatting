import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { Appearance, Platform, useColorScheme } from 'react-native';
import { VariableContextProvider } from 'nativewind';
import { darkTokens, lightTokens, type ThemeMode } from './tokens';

type ThemeContextValue = {
  theme: ThemeMode;
  resolved: 'light' | 'dark';
  setTheme: (mode: ThemeMode) => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

/** SSR·첫 hydration과 동일한 기본값. 시스템 테마는 마운트 후에만 반영합니다. */
const SSR_RESOLVED: 'light' | 'dark' = 'light';

function applyWebDocumentClass(resolved: 'light' | 'dark', mode: ThemeMode) {
  if (Platform.OS !== 'web' || typeof document === 'undefined') {
    return;
  }
  const root = document.documentElement;
  root.classList.remove('light', 'dark');
  if (mode === 'system') {
    // OS preference via media query; keep class off for .light/.dark overrides
    return;
  }
  root.classList.add(resolved);
}

function resolveScheme(
  theme: ThemeMode,
  systemScheme: 'light' | 'dark' | null | undefined,
  hydrated: boolean,
): 'light' | 'dark' {
  if (theme !== 'system') {
    return theme;
  }
  // Avoid server/client mismatch: useColorScheme() is often null on SSR
  // and 'dark'|'light' on the client before paint.
  if (!hydrated) {
    return SSR_RESOLVED;
  }
  return systemScheme === 'dark' ? 'dark' : 'light';
}

type ThemeProviderProps = {
  children: ReactNode;
  initialTheme?: ThemeMode;
  onThemeChange?: (mode: ThemeMode) => void;
};

export function ThemeProvider({
  children,
  initialTheme = 'system',
  onThemeChange,
}: ThemeProviderProps) {
  const systemScheme = useColorScheme();
  const [theme, setThemeState] = useState<ThemeMode>(initialTheme);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setHydrated(true);
  }, []);

  const resolved = resolveScheme(theme, systemScheme, hydrated);

  const setTheme = useCallback(
    (mode: ThemeMode) => {
      setThemeState(mode);
      const scheme =
        mode === 'system' ? ('unspecified' as const) : mode;
      if (typeof Appearance.setColorScheme === 'function') {
        Appearance.setColorScheme(
          scheme as Parameters<typeof Appearance.setColorScheme>[0],
        );
      }
      const nextResolved =
        mode === 'system'
          ? Appearance.getColorScheme() === 'dark'
            ? 'dark'
            : 'light'
          : mode;
      applyWebDocumentClass(nextResolved, mode);
      onThemeChange?.(mode);
    },
    [onThemeChange],
  );

  useEffect(() => {
    if (!hydrated) {
      return;
    }
    applyWebDocumentClass(resolved, theme);
  }, [hydrated, resolved, theme]);

  const value = useMemo(
    () => ({ theme, resolved, setTheme }),
    [theme, resolved, setTheme],
  );

  // SSR·첫 hydration은 light로 고정해 서버 HTML과 맞추고,
  // 마운트 뒤에만 시스템/강제 테마 토큰을 적용합니다.
  const variables = useMemo(() => {
    if (!hydrated) {
      return lightTokens;
    }
    return resolved === 'dark' ? darkTokens : lightTokens;
  }, [hydrated, resolved]);

  return (
    <ThemeContext.Provider value={value}>
      <VariableContextProvider value={variables}>
        {children}
      </VariableContextProvider>
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return ctx;
}

export type { ThemeMode };
