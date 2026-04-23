import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';

import type { AppLocaleCode } from '@/i18n/appLocales';
import { storage } from '@/utils/mmkv';
import { MMKV_KEYS } from '@/utils/mmkvKeys';

export function useAppLanguage() {
  const { i18n } = useTranslation();

  const setLanguage = useCallback(
    (code: AppLocaleCode) => {
      storage.set(MMKV_KEYS.appLanguage, code);
      void i18n.changeLanguage(code);
    },
    [i18n],
  );

  return {
    current: i18n.language.split('-')[0] ?? i18n.language,
    setLanguage,
  };
}
