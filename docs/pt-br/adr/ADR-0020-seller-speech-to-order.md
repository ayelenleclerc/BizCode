# ADR-0020: Tomada de pedido por voz App Seller (híbrido Whisper + STT on-device)

**Status:** Aceito  
**Data:** 2026-08-14  
**Referência ISO:** ISO/IEC 12207:2017 §6.3.2; ISO/IEC 27001:2022 A.8.24

---

## Contexto

O issue [#266](https://github.com/ayelenleclerc/BizCode/issues/266) pede ditado de itens no App Seller (Expo SDK 57). Opções: A (STT on-device) vs B (Whisper + GPT). Decisão: **transcrição híbrida** e **matching determinístico**.

Evidência: `addOrIncrement` em [`CartContext.tsx`](../../../apps/seller/src/pedidos/CartContext.tsx), `GET /api/articulos?q=` e SQLite (#171), `Articulo.unidadBase` / `umedida` (não existe `unidadMedida`), segredos via env ([ADR-0015](ADR-0015-secrets-management.md)).

## Decisão

1. `POST /api/voice/transcribe` (Bearer, `orders.create`) devolve só `{ text }`. `OPENAI_API_KEY` opcional; ausente → 503 e fallback STT local.
2. STT on-device com plugin Expo SDK 57. Expo Go pode não incluir; EAS (#173) é o veículo nativo.
3. Parser para `unidadBase`; conversão caixa só com `factorConversion`.
4. Top-3 fuzzy em SKUs vendáveis; catálogo não vai à OpenAI.
5. Nada no carrinho sem confirmação.
6. Ruído de armazém: teste manual, não CI.
7. Sem migration Prisma.

## Consequências

- Offline funciona sem chave cloud; a chave não fica no app.
- Dois caminhos STT; Whisper depende do operador.
- Não evidenciado: GPT, persistir áudio, WER formal.

## Referências

- Issue #266
- [ADR-0015](ADR-0015-secrets-management.md)
- [Guia ambiente local](../quality/guia-ambiente-local-desenvolvimento.md)
