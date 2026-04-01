# ADR-0004: Automatización E2E (Playwright) y hoja de ruta de pruebas de integración

**Estado:** Aceptada  
**Fecha:** 2026-03-31  
**Referencia ISO:** ISO/IEC 29119-2, ISO/IEC 12207:2017 §6.4.9

---

## Contexto

- Las pruebas de contrato ([ADR-0003](ADR-0003-api-contract-testing.md)) mockean Prisma y validan HTTP + OpenAPI; no demuestran el stack completo contra una base real.
- El **escritorio** es Tauri + WebView; la **UI web** es Vite + React.
- Se requiere un enfoque **por fases y documentado** para E2E automatizado y futuras pruebas de integración con PostgreSQL sin afirmar cobertura o herramientas inexistentes en CI.

## Decisión

1. **E2E automatizado (fase A — implementada):** usar **Playwright** contra **`vite preview`** tras `vite build`. Pruebas en `e2e/`; CI instala solo **Chromium** y ejecuta `npm run test:e2e`. Alcance inicial: **smoke** (carga la ruta raíz, `#root` visible, título del documento). Valida el cáspide de la SPA; **no** sustituye pruebas manuales del envoltorio Tauri ni integraciones nativas.
2. **Integración con PostgreSQL (fase B — implementada):** el workflow de GitHub Actions expone **PostgreSQL 16** y ejecuta `npx prisma migrate deploy` antes de las pruebas. Las pruebas **automatizadas** están en `tests/integration/` (`npm run test:integration`, `vitest.integration.config.ts`): `PrismaClient` real, HTTP con supertest, tablas vaciadas con `TRUNCATE … CASCADE` entre casos. Complementan (no sustituyen) el contrato API con Prisma mockeado. Cambios relevantes de alcance de cobertura o de CI siguen documentándose en ADR.
3. **Alcance de cobertura Vitest:** cualquier ampliación de `coverage.include` en `vitest.config.ts` más allá de `src/lib/**/*.ts`, `server/createApp.ts` y `server.ts` exige un **ADR nuevo** y umbrales explícitos (sin ampliación silenciosa). El arranque de `server.ts` queda descrito en [ADR-0005](ADR-0005-vitest-coverage-server-bootstrap.md).

## Consecuencias

- **Positivo:** smoke E2E repetible en CI; límite claro entre pruebas web SPA y escritorio Tauri.
- **Negativo:** tiempo de CI y caché de navegador Playwright; `build:web` antes del preview (coste del job E2E).
- **Mantenimiento:** actualizar Playwright y smokes si cambian rutas o arranque; alinear `playwright.config.ts` con el puerto de `vite preview`.

## Referencias

- [estrategia-pruebas.md](../quality/estrategia-pruebas.md)
- `playwright.config.ts`, `e2e/smoke.spec.ts`
- `vitest.integration.config.ts`, `tests/integration/`
- `.github/workflows/ci.yml`
