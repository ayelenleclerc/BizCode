# ADR-0002: Internationalization Library — react-i18next

**Status:** Accepted
**Date:** 2026-01-15
**ISO Reference:** ISO/IEC 25010:2023 §4.2.8 (Portability — Adaptability)

---

## Context

BizCode targets Spanish-speaking markets (Argentina) but must support English and Brazilian Portuguese for international clients and compliance audits. A translation framework is needed that:

1. Works inside Tauri's WebView (no access to the filesystem via `fetch()`).
2. Integrates with React 18 hooks.
3. Supports pluralization, interpolation, and namespace organization.
4. Has a low compile-step overhead.

Options considered:

1. **react-i18next + i18next (chosen)**: Most widely used React i18n library. Supports static resource imports (required for Tauri). Namespace-based organization. No compile step.
2. **react-intl (FormatJS)**: Mature and standards-based (ICU message format). Heavier bundle (~30KB vs ~15KB for i18next). Static imports are supported but less idiomatic.
3. **Lingui**: Excellent DX with `<Trans>` component. **Requires a compile step** (`lingui extract` + `lingui compile`) that is incompatible with Tauri's hot-reload development workflow.

## Decision

Use **react-i18next** with **i18next**, loading locale JSON files via static ES module imports (not via `i18next-http-backend`).

Static imports are placed in `src/i18n/config.ts` and initialized before the React root renders (`src/main.tsx`).

## Consequences

**Positive:**
- Static imports work correctly in Tauri WebView — no HTTP fetch to the filesystem.
- Namespace-per-module organization keeps locale files small and co-located with features.
- `useTranslation('namespace')` hook integrates cleanly with React functional components.
- `scripts/check-i18n.ts` enforces key parity between locales in CI.

**Negative:**
- All locale JSON is included in the bundle regardless of the selected language (no lazy loading). Acceptable given that all 3 locales together are < 20KB.
- Adding a new locale requires code changes in `src/i18n/config.ts` (not a CMS/runtime update). This is acceptable for the current scope.
