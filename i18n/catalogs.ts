import en from '../messages/en.json';
import yo from '../messages/yo.json';
import ha from '../messages/ha.json';
import ig from '../messages/ig.json';
import pcm from '../messages/pcm.json';
import type { AppLocale } from './locales';

export const catalogs: Record<AppLocale, typeof en> = { en, yo, ha, ig, pcm };
