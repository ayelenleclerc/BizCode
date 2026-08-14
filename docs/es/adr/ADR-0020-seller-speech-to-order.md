# ADR-0020: Toma de pedido por voz App Seller (híbrido Whisper + STT on-device)

**Estado:** Aceptado  
**Fecha:** 2026-08-14  
**Referencia ISO:** ISO/IEC 12207:2017 §6.3.2; ISO/IEC 27001:2022 A.8.24

---

## Contexto

El issue [#266](https://github.com/ayelenleclerc/BizCode/issues/266) pide dictar ítems en App Seller (Expo SDK 57). Opciones del issue: A (STT on-device) vs B (Whisper + GPT opcional). Decisión de sprint: **transcripción híbrida** y **matching determinista** al catálogo.

Evidencia: `addOrIncrement` en [`CartContext.tsx`](../../../apps/seller/src/pedidos/CartContext.tsx), `GET /api/articulos?q=` y SQLite (#171), `Articulo.unidadBase` / `umedida` (no existe `unidadMedida`), secretos por env ([ADR-0015](ADR-0015-secrets-management.md)).

Opciones:

1. Solo on-device.
2. Whisper + GPT (el catálogo o el utterance irían a un LLM).
3. **Híbrido + fuzzy (elegida).**

## Decisión

1. `POST /api/voice/transcribe` (Bearer, `orders.create`) devuelve solo `{ text }`. `OPENAI_API_KEY` opcional; si falta → 503 y fallback STT local.
2. STT on-device con plugin Expo SDK 57. Expo Go puede no incluirlo; EAS (#173) es el vehículo nativo.
3. Parser hacia `unidadBase`; conversión caja solo con `factorConversion`.
4. Top-3 fuzzy sobre filas vendibles; el catálogo no se envía a OpenAI.
5. Nada al carrito sin confirmación.
6. Ruido almacén: prueba manual, no CI.
7. Sin migración Prisma.

## Consecuencias

- Offline funciona sin clave cloud; la clave no vive en la app.
- Dos caminos STT; Whisper depende del operador.
- No evidenciado: GPT, persistir audio, WER formal.

## Referencias

- Issue #266
- [ADR-0015](ADR-0015-secrets-management.md)
- [Guía entorno local](../quality/guia-entorno-local-desarrollo.md)
