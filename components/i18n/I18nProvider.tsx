'use client';

import * as React from 'react';
import { NextIntlClientProvider } from 'next-intl';
import { catalogs } from '@/i18n/catalogs';
import { isLocale, type AppLocale } from '@/i18n/locales';

const LocaleContext = React.createContext<{
  locale: AppLocale;
  setLocale: (locale: AppLocale) => void;
}>({
  locale: 'en',
  setLocale: () => undefined,
});

export function useI18n() {
  return React.useContext(LocaleContext);
}

export function I18nProvider({
  initialLocale,
  children,
}: {
  initialLocale: string;
  children: React.ReactNode;
}) {
  const [locale, setLocaleState] = React.useState<AppLocale>(isLocale(initialLocale) ? initialLocale : 'en');

  React.useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  const setLocale = React.useCallback((next: AppLocale) => {
    setLocaleState(next);
    document.cookie = `NEXT_LOCALE=${next};path=/;max-age=31536000;SameSite=Lax`;
    localStorage.setItem('mcenies-locale', next);
  }, []);

  return (
    <LocaleContext.Provider value={{ locale, setLocale }}>
      <NextIntlClientProvider locale={locale} messages={catalogs[locale]} timeZone="Africa/Lagos">
        {children}
      </NextIntlClientProvider>
    </LocaleContext.Provider>
  );
}

export function LocaleFrame({
  locale,
  children,
}: {
  locale: AppLocale;
  children: React.ReactNode;
}) {
  return (
    <NextIntlClientProvider key={locale} locale={locale} messages={catalogs[locale]} timeZone="Africa/Lagos">
      {children}
    </NextIntlClientProvider>
  );
}
