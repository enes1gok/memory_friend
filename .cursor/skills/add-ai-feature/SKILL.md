---
name: add-ai-feature
description: Adds or changes OpenAI (Whisper/GPT) usage in memory_friend with offline safety, cost awareness, and persistence. Use when integrating transcription, emotion tagging, or companion messages.
---

# Add AI feature (OpenAI)

## Read first

- [.cursor/rules/behavioral-psychology.mdc](../rules/behavioral-psychology.mdc) — AI must not block capture; empathetic companion tone.
- [.cursor/rules/index.mdc](../rules/index.mdc) — offline-first; minimum data sent.
- [subscription-gate](../subscription-gate/SKILL.md) — Pro-only AI surfaces per PRD.

## Principles

1. **Never block capture** — User can always save journal/media without network; AI runs **after** commit or in background with retry.
2. **Try/catch everything** — Timeouts, rate limits, and parse errors → user-safe fallback (empty transcript, “try again”, queued job).
3. **Persist results** — Once received, store transcript/tags on the **WatermelonDB** row; avoid duplicate API calls on reopen.
4. **Tag requests** — Log `feature` / `screen` for cost monitoring (e.g. `journal.transcribe`, `companion.nudge`).

## Whisper (speech-to-text)

- Send **audio** per API constraints (format, size); compress or chunk if needed.
- Handle **long recordings** with progress UI or background task — don’t freeze the UI.

## GPT (emotion / companion)

- Use structured prompts; validate JSON if using function-style outputs.
- **Pro gating** — Check [subscription-gate](../subscription-gate/SKILL.md) before premium models or high token limits.

## Checklist

```
- [ ] Offline path tested (airplane mode) — app usable
- [ ] Results saved to DB; idempotent retries (same entry → no duplicate charge if possible)
- [ ] No secrets in client — use env + EAS secrets / server proxy if required
- [ ] User-facing errors localized ([add-i18n-key](../add-i18n-key/SKILL.md))
```

## Anti-patterns

- Awaiting OpenAI in the middle of the 15s capture loop without a skip path.
- Sending full media files to GPT when only text/metadata is needed.
