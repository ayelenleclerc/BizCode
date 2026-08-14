# ADR-0020: Seller speech-to-order (hybrid Whisper + on-device STT)

**Status:** Accepted  
**Date:** 2026-08-14  
**ISO reference:** ISO/IEC 12207:2017 §6.3.2 (software design); ISO/IEC 27001:2022 A.8.24 (cryptography / secrets)

---

## Context

Issue [#266](https://github.com/ayelenleclerc/BizCode/issues/266) asks for spoken order taking on App Seller (`apps/seller` Expo SDK 57). The issue listed Option A (on-device STT) vs Option B (OpenAI Whisper + optional GPT mapping). Sprint decision: **hybrid transcription**, **deterministic catalog matching**.

Existing evidence: cart `addOrIncrement` ([`CartContext.tsx`](../../../apps/seller/src/pedidos/CartContext.tsx)), catalog `GET /api/articulos?q=` and SQLite hydrate (#171), `Articulo.unidadBase` / `umedida` (no `unidadMedida` field), secrets via env ([ADR-0015](ADR-0015-secrets-management.md)).

Options considered:

1. **On-device only** — no OpenAI cost; weaker accuracy; Expo Go often lacks the native module.
2. **Whisper + GPT mapping** — sends catalog or utterances to an LLM; extra cost; secret risk if the key were embedded in the app.
3. **Hybrid STT + fuzzy match (chosen)** — Whisper on the API when online; on-device STT when offline or Whisper fails; parser + top-3 fuzzy match stay in-app; **no** GPT SKU mapping.

## Decision

1. **Transcription:** `POST /api/voice/transcribe` (Bearer, `orders.create`, `x-bizcode-channel: field`) accepts multipart audio and returns `{ text }` only. Server uses `OPENAI_API_KEY` (optional). Missing key → HTTP 503 so the client falls back to on-device STT.
2. **On-device STT:** Expo config plugin compatible with SDK 57 (`expo-speech-recognition`). Expo Go may not include it; EAS build (#173) is the native test vehicle. No `expo-dev-client` unless the plugin requires it.
3. **Parser / units:** `parseSpokenOrder` + `normalizeUnit` map speech to `unidadBase`. Caja→base units only when `factorConversion` is present on the matched row.
4. **Matching:** `rankArticuloMatches` over sellable rows (`activo !== false`, `!esPadre`). Top 3 for disambiguation. Catalog never sent to OpenAI.
5. **Confirmation:** no cart mutation until the seller confirms each line. Empty parse → i18n retry message.
6. **Warehouse noise AC:** manual on-device check. CI does not measure WER.
7. **Prisma:** no migration (audio is not stored).

## Consequences

- **Positive:** Offline still works without a cloud key; production secrets stay on the server; parser is unit-tested in three locales.
- **Negative:** Two STT paths to maintain; Whisper quality depends on the operator configuring `OPENAI_API_KEY`; Expo Go may only exercise the confirmation UI with mocked/dev fallbacks.
- **Not evidenced:** GPT catalog mapping, persisted utterances, formal WER in a warehouse.

## References

- Issue #266
- [ADR-0015: Secrets management](ADR-0015-secrets-management.md)
- [Local development setup](../quality/local-development-setup.md)
