/* eslint-disable import/no-named-as-default-member -- default export is the i18next singleton; named `use` is unrelated */
import i18next from 'i18next';
import { initReactI18next } from 'react-i18next';

import en from './locales/en.json';

void i18next.use(initReactI18next).init({
  compatibilityJSON: 'v4',
  lng: 'en',
  fallbackLng: 'en',
  resources: {
    en: { translation: en },
  },
  interpolation: {
    escapeValue: false,
  },
});

export default i18next;
