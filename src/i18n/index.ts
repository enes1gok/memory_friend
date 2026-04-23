/* eslint-disable import/no-named-as-default-member -- default export is the i18next singleton; named `use` is unrelated */
import i18next from 'i18next';
import { initReactI18next } from 'react-i18next';

import { storage } from '@/utils/mmkv';
import { MMKV_KEYS } from '@/utils/mmkvKeys';

import { isAppLocaleCode } from './appLocales';
import de from './locales/de.json';
import en from './locales/en.json';
import es from './locales/es.json';
import fr from './locales/fr.json';
import it from './locales/it.json';
import tr from './locales/tr.json';
import zh from './locales/zh.json';

function resolveInitialLanguage(): string {
  const stored = storage.getString(MMKV_KEYS.appLanguage);
  if (stored && isAppLocaleCode(stored)) {
    return stored;
  }
  return 'en';
}

void i18next.use(initReactI18next).init({
  compatibilityJSON: 'v4',
  lng: resolveInitialLanguage(),
  fallbackLng: 'en',
  resources: {
    en: { translation: en },
    tr: { translation: tr },
    es: { translation: es },
    de: { translation: de },
    zh: { translation: zh },
    it: { translation: it },
    fr: { translation: fr },
  },
  interpolation: {
    escapeValue: false,
  },
});

export default i18next;
