# ADR-0002: Biblioteca de internacionalización — react-i18next

**Estado:** Aceptada  
**Fecha:** 2026-01-15  
**Referencia ISO:** ISO/IEC 25010:2023 §4.2.8 (Portabilidad)

## Contexto

BizCode apunta a mercados hispanohablantes pero debe soportar inglés y portugués brasileño. El framework no puede depender de `fetch()` al sistema de archivos en el WebView de Tauri.

## Opciones

1. **react-i18next + i18next (elegido)** — amplio uso; imports estáticos; namespaces.
2. react-intl — más pesado.
3. Lingui — requiere paso de compilación incompatible con el flujo de desarrollo en Tauri.

## Decisión

**react-i18next** con recursos JSON importados estáticamente en `src/i18n/config.ts` antes del render de React.

## Consecuencias

**Positivas:** funciona en Tauri; `check-i18n` en CI.

**Negativas:** todos los locales en el bundle; nuevo locale requiere cambios en código.

**Otros idiomas:** [English](../../en/adr/ADR-0002-i18n-library.md) · [Português](../../pt-br/adr/ADR-0002-i18n-library.md)
