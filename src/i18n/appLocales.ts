/**
 * Shipped app locales — single source for picker UI and boot-time validation.
 * Display names are native so they stay readable in any UI language.
 */
export const APP_LOCALES = [
  { code: 'en', nativeName: 'English' },
  { code: 'tr', nativeName: 'Türkçe' },
  { code: 'es', nativeName: 'Español' },
  { code: 'de', nativeName: 'Deutsch' },
  { code: 'zh', nativeName: '中文' },
  { code: 'it', nativeName: 'Italiano' },
  { code: 'fr', nativeName: 'Français' },
] as const;

export type AppLocaleCode = (typeof APP_LOCALES)[number]['code'];

export function isAppLocaleCode(value: string): value is AppLocaleCode {
  return APP_LOCALES.some((l) => l.code === value);
}

export function nativeNameForLocale(code: string): string {
  const row = APP_LOCALES.find((l) => l.code === code);
  return row?.nativeName ?? code;
}
