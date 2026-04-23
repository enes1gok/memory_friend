import OpenAI from 'openai';

let client: OpenAI | null | undefined;

/**
 * Lazy singleton. Returns `null` if `EXPO_PUBLIC_OPENAI_API_KEY` is missing (offline / dev without keys).
 * Safe to call from any feature; do not import OpenAI in hot paths that must work without network.
 */
export function getOpenAIClient(): OpenAI | null {
  if (client === undefined) {
    const key = process.env.EXPO_PUBLIC_OPENAI_API_KEY;
    if (!key) {
      client = null;
    } else {
      client = new OpenAI({ apiKey: key, dangerouslyAllowBrowser: true });
    }
  }
  return client;
}
