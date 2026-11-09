export const locales = ['en', 'yo', 'ha', 'ig', 'pcm'] as const;

export type AppLocale = (typeof locales)[number];

export function isLocale(value: string | undefined | null): value is AppLocale {
  return locales.includes(value as AppLocale);
}
