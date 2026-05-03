# ADR-0006: CI opcional — semantic-release y build Tauri self-hosted

**Estado:** Aceptada  
**Fecha:** 2026-03-31  
**Referencia ISO:** ISO/IEC 12207:2017 §6.4.9 (despliegue / release)

---

## Contexto

El pipeline por defecto ([ciclo-ci-cd.md](../quality/ciclo-ci-cd.md)) no publica releases ni construye artefactos Tauri desktop. El backlog de mejoras **opcionales** incluía `npm audit` no bloqueante, **semantic-release** y **Tauri** en runner self-hosted.

## Decisión

1. **`npm audit`:** el workflow ejecuta `npm audit --audit-level=high` tras `npm ci` con **`continue-on-error: true`** para visibilidad sin fallar el gate.
2. **semantic-release:** `release.config.cjs` en la raíz; `.github/workflows/release.yml` solo con **`workflow_dispatch`**, crea GitHub Releases desde commits convencionales en `main` con `GITHUB_TOKEN`. Sin publicación npm (paquete `private`).
3. **Tauri self-hosted:** `.github/workflows/tauri-selfhosted.yml` solo **`workflow_dispatch`** en **`runs-on: self-hosted`**. El runner debe tener Rust, Node y dependencias WebView nativas — no sustituye el job de calidad en `ubuntu-latest`.

## Consecuencias

- **Positivo:** automatización opcional documentada y versionada; el gate principal de PR no cambia.
- **Negativo:** semantic-release y Tauri requieren disparo manual y runner adecuado.

## Checklist de release (operador / escritorio)

1. Verificar **`main`** con **Quality Gate** estándar (`ci.yml`): API, docs regenerados, ESLint, umbrales Vitest según `vitest.config.ts`, Playwright (`vite build` + preview), integración PostgreSQL.
2. Antes de distribuir **instaladores escritorio**, ejecutar **Actions → build Tauri self-hosted** (`tauri-selfhosted.yml`) en un runner self-hosted con Rust + WebView. **No forma parte del gate de cada PR** y no reemplaza el gate SaaS (véase «Qué NO está en CI» en [ciclo-ci-cd.md](../quality/ciclo-ci-cd.md)).
3. Si se usan tags con semantic-release, disparar **`release.yml`** (`workflow_dispatch` en `main`) tras validar el punto 2 cuando haga falta artefacto de escritorio etiquetado.

## Referencias

- [ciclo-ci-cd.md](../quality/ciclo-ci-cd.md)
- `release.config.cjs`, `.github/workflows/release.yml`, `.github/workflows/tauri-selfhosted.yml`
