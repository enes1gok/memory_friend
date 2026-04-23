import { getOpenAIClient } from '../client';

export const ALLOWED_EMOTION_TAGS = [
  'stressed',
  'motivated',
  'exhausted',
  'happy',
  'sad',
  'calm',
  'anxious',
  'proud',
] as const;

const ALLOWED = new Set<string>(ALLOWED_EMOTION_TAGS);

export type EnrichmentGptResult = {
  emotionTags: string[];
  companionMessage: string | null;
};

/**
 * One GPT call: emotion tags + short companion line from the transcript. Offline-safe: returns empty tags and null message on failure.
 */
export async function tagEmotionsAndCompanion(transcript: string): Promise<EnrichmentGptResult> {
  const trimmed = transcript.trim();
  if (!trimmed) {
    return { emotionTags: [], companionMessage: null };
  }

  const openai = getOpenAIClient();
  if (!openai) {
    return { emotionTags: [], companionMessage: null };
  }

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      response_format: { type: 'json_object' },
      temperature: 0.4,
      max_tokens: 220,
      messages: [
        {
          role: 'system',
          content: `You are a warm, non-judgmental journaling companion. Analyze the user's spoken journal snippet.
Return a JSON object with exactly these keys:
- "emotionTags": string[] — 1-4 items from this set only: ${ALLOWED_EMOTION_TAGS.join(', ')}.
- "companionMessage": string — 1-2 short sentences, supportive and specific to their words. Never shame or guilt. No emojis. Max ~240 characters.
If the text is too vague, still pick the closest tags and a gentle check-in for companionMessage.`,
        },
        { role: 'user', content: trimmed },
      ],
    });

    const raw = completion.choices[0]?.message?.content;
    if (!raw) {
      return { emotionTags: [], companionMessage: null };
    }

    let parsed: unknown;
    try {
      parsed = JSON.parse(raw) as unknown;
    } catch {
      return { emotionTags: [], companionMessage: null };
    }

    if (typeof parsed !== 'object' || parsed === null) {
      return { emotionTags: [], companionMessage: null };
    }

    const p = parsed as { emotionTags?: unknown; companionMessage?: unknown };
    const tagsIn = Array.isArray(p.emotionTags) ? p.emotionTags : [];
    const emotionTags = tagsIn
      .filter((t): t is string => typeof t === 'string')
      .map((t) => t.toLowerCase().trim())
      .filter((t) => ALLOWED.has(t));
    // unique preserve order
    const seen = new Set<string>();
    const unique: string[] = [];
    for (const t of emotionTags) {
      if (!seen.has(t)) {
        seen.add(t);
        unique.push(t);
      }
    }

    let companionMessage: string | null = null;
    if (typeof p.companionMessage === 'string') {
      const c = p.companionMessage.trim();
      companionMessage = c.length > 0 ? c : null;
    }

    return { emotionTags: unique, companionMessage };
  } catch (e) {
    console.warn('[tagEmotionsAndCompanion] failed', e);
    return { emotionTags: [], companionMessage: null };
  }
}
