import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import ar from '../locales/ar.json';
import en from '../locales/en.json';

export type Lang = 'ar' | 'en';
export type Theme = 'light' | 'dark' | 'youtube';

type AppContextValue = {
  lang: Lang;
  theme: Theme;
  t: any;
  setLang: (lang: Lang) => void;
  setTheme: (theme: Theme) => void;
  toggleLang: () => void;
  toggleTheme: () => void;
  isRtl: boolean;
};

const AppContext = createContext<AppContextValue | null>(null);

function resolveInitialLang(): Lang {
  const saved = localStorage.getItem('lang');
  if (saved === 'ar' || saved === 'en') return saved;
  return 'en';
}

function resolveInitialTheme(): Theme {
  const saved = localStorage.getItem('theme');
  if (saved === 'light' || saved === 'dark' || saved === 'youtube') return saved;
  // Migrate legacy customDark → youtube
  if (saved === 'customDark') return 'youtube';
  return 'youtube';
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>(resolveInitialLang);
  const [theme, setThemeState] = useState<Theme>(resolveInitialTheme);

  const t = useMemo(() => (lang === 'ar' ? ar : en), [lang]);
  const isRtl = lang === 'ar';

  const setLang = useCallback((next: Lang) => {
    setLangState(next);
  }, []);

  const setTheme = useCallback((next: Theme) => {
    setThemeState(next);
  }, []);

  const toggleLang = useCallback(() => {
    setLangState((prev) => (prev === 'ar' ? 'en' : 'ar'));
  }, []);

  const toggleTheme = useCallback(() => {
    setThemeState((prev) => {
      if (prev === 'youtube') return 'light';
      if (prev === 'light') return 'dark';
      return 'youtube';
    });
  }, []);

  useEffect(() => {
    localStorage.setItem('lang', lang);
    const html = document.documentElement;
    html.setAttribute('dir', lang === 'ar' ? 'rtl' : 'ltr');
    html.setAttribute('lang', lang);
  }, [lang]);

  useEffect(() => {
    localStorage.setItem('theme', theme);
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const value = useMemo(
    () => ({
      lang,
      theme,
      t,
      setLang,
      setTheme,
      toggleLang,
      toggleTheme,
      isRtl,
    }),
    [lang, theme, t, setLang, setTheme, toggleLang, toggleTheme, isRtl]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) {
    throw new Error('useApp must be used within AppProvider');
  }
  return ctx;
}
