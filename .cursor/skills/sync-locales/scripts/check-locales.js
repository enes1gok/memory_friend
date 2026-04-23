#!/usr/bin/env node
/**
 * Compares all locale JSON files under src/i18n/locales/ to en.json.
 * Exits 1 if any locale is missing keys or has extra keys vs en.
 */
const fs = require('fs');
const path = require('path');

const PROJECT_ROOT = path.resolve(__dirname, '..', '..', '..', '..');
const LOCALES_DIR = path.join(PROJECT_ROOT, 'src', 'i18n', 'locales');
const SOURCE_LOCALE = 'en';

const EXPECTED_LOCALES = ['en', 'tr', 'es', 'de', 'zh', 'it', 'fr'];

/**
 * @param {unknown} value
 * @param {string} prefix
 * @returns {string[]}
 */
function collectKeys(value, prefix = '') {
  if (value === null || typeof value !== 'object' || Array.isArray(value)) {
    return prefix ? [prefix] : [];
  }
  /** @type {string[]} */
  const keys = [];
  for (const k of Object.keys(value).sort()) {
    const next = prefix ? `${prefix}.${k}` : k;
    const child = /** @type {Record<string, unknown>} */ (value)[k];
    if (child !== null && typeof child === 'object' && !Array.isArray(child)) {
      keys.push(...collectKeys(child, next));
    } else {
      keys.push(next);
    }
  }
  return keys;
}

/**
 * @param {string} localeCode
 * @returns {Record<string, unknown>}
 */
function loadLocale(localeCode) {
  const filePath = path.join(LOCALES_DIR, `${localeCode}.json`);
  if (!fs.existsSync(filePath)) {
    console.error(`Missing locale file: ${path.relative(PROJECT_ROOT, filePath)}`);
    process.exit(1);
  }
  const raw = fs.readFileSync(filePath, 'utf8');
  try {
    return JSON.parse(raw);
  } catch (e) {
    console.error(`Invalid JSON: ${filePath}`);
    console.error(e);
    process.exit(1);
  }
}

function main() {
  if (!fs.existsSync(LOCALES_DIR)) {
    console.error(`Locales directory not found: ${LOCALES_DIR}`);
    process.exit(1);
  }

  const en = loadLocale(SOURCE_LOCALE);
  const enKeys = new Set(collectKeys(en));

  let hasErrors = false;

  for (const code of EXPECTED_LOCALES) {
    if (code === SOURCE_LOCALE) continue;

    const data = loadLocale(code);
    const keys = new Set(collectKeys(data));

    const missing = [...enKeys].filter((k) => !keys.has(k));
    const extra = [...keys].filter((k) => !enKeys.has(k));

    if (missing.length || extra.length) {
      hasErrors = true;
      console.error(`\n[${code}] vs ${SOURCE_LOCALE}.json:`);
      if (missing.length) {
        console.error(`  Missing (${missing.length}):`);
        missing.forEach((k) => console.error(`    - ${k}`));
      }
      if (extra.length) {
        console.error(`  Extra (${extra.length}):`);
        extra.forEach((k) => console.error(`    + ${k}`));
      }
    }
  }

  if (hasErrors) {
    console.error('\nFix key parity, then re-run this script.');
    process.exit(1);
  }

  console.log(
    `OK: ${EXPECTED_LOCALES.join(', ')} match ${SOURCE_LOCALE}.json key structure.`,
  );
}

main();
