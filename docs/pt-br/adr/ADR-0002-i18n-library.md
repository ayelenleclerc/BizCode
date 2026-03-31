# ADR-0002: Biblioteca de internacionalização — react-i18next

**Status:** Aceita  
**Data:** 2026-01-15  
**Referência ISO:** ISO/IEC 25010:2023 §4.2.8 (Portabilidade)

## Contexto

Suporte a espanhol, inglês e português brasileiro sem `fetch` ao sistema de arquivos no WebView.

## Decisão

**react-i18next** + **i18next** com imports estáticos dos JSON em `src/i18n/config.ts`.

## Consequências

**Positivas:** funciona no Tauri; namespaces por módulo; `check-i18n` no CI.

**Negativas:** todos os locales no bundle; novo locale exige alteração em `config.ts`.

**Outros idiomas:** [English](../../en/adr/ADR-0002-i18n-library.md) · [Español](../../es/adr/ADR-0002-i18n-library.md)
