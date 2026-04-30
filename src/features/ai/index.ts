/** OpenAI, Whisper, companion UI (Phase 7+). */
export { getOpenAIClient } from './client';
export { CompanionCard } from './components/CompanionCard';
export { useCompanionLine } from './hooks/useCompanionLine';
export { HypeManModal } from './components/HypeManModal';
export { useAiCompanionNudge } from './hooks/useAiCompanionNudge';
export { useEnrichJournalEntry } from './hooks/useEnrichJournalEntry';
export type { TriggerEnrichmentArgs } from './hooks/useEnrichJournalEntry';
export { detectRepeatedStress } from './logic/detectRepeatedStress';
export type { EmotionRow } from './logic/detectRepeatedStress';
export { tagEmotionsAndCompanion, ALLOWED_EMOTION_TAGS } from './logic/tagEmotions';
export type { EnrichmentGptResult } from './logic/tagEmotions';
export { transcribeAudio } from './logic/transcribeAudio';
