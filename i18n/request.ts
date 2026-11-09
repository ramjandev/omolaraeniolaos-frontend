import { cookies } from 'next/headers';
import { getRequestConfig } from 'next-intl/server';
import { catalogs } from './catalogs';
import { isLocale } from './locales';

export default getRequestConfig(async () => {
  const store = await cookies();
  const requested = store.get('NEXT_LOCALE')?.value;
  const locale = isLocale(requested) ? requested : 'en';

  return {
    locale,
    messages: catalogs[locale],
  };
});
