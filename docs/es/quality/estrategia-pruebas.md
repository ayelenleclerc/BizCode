# Estrategia de pruebas

**Norma:** ISO/IEC 29119-2 (planificación de pruebas), ISO/IEC 29119-4 (técnicas de prueba)

---

## Pirámide de pruebas

```
          ┌─────────────────┐
          │   E2E (Manual)  │   Smoke por release
          ├─────────────────┤
          │  Integración    │   CI: servicio PostgreSQL (preparado; tests actuales mockean HTTP)
          │  (futuro)       │
          ├─────────────────┤
          │  Unitarias + a11y │ CI: 100% líneas/funciones/ramas en src/lib/** y server/createApp.ts
          │  (Vitest+axe)   │       Smoke axe en App (src/App.a11y.test.tsx)
          ├─────────────────┤
          │  Contrato API   │   tests/api/contract.test.ts (supertest + Ajv vs openapi.yaml)
          └─────────────────┘
```

## Política de cobertura

| Alcance | Líneas | Funciones | Ramas | Sentencias |
|---|---|---|---|---|
| **`src/lib/**/*.ts`** (excluye `*.test.ts`) | **100%** | **100%** | **100%** | **100%** |
| **`server/createApp.ts`** (API Express; Prisma inyectado) | **100%** | **100%** | **100%** | **100%** |

Exclusiones adicionales del informe de cobertura solo con **ADR** o aprobación en esta estrategia, nombradas en `vitest.config.ts`. Ver [ADR-0003](../adr/ADR-0003-api-contract-testing.md).

Los umbrales los aplica Vitest (`coverage.thresholds`). El CI falla si no se cumplen.

## Herramientas

| Herramienta | Versión | Uso |
|---|---|---|
| Vitest | 4.x | Runner, `expect`, mocks `vi` |
| @vitest/coverage-v8 | 4.x | Instrumentación V8 |
| @testing-library/react | latest | Render en jsdom |
| @testing-library/jest-dom | latest | Matchers DOM |
| jest-axe | latest | Smoke de accesibilidad (axe-core) |
| supertest | latest | HTTP hacia Express en contrato API |
| @apidevtools/swagger-parser | latest | Dereferenciación OpenAPI |
| yaml | latest | Parse local de `docs/api/openapi.yaml` |
| ajv + ajv-formats | latest | Validación JSON Schema de respuestas |
| jsdom | latest | Simulación DOM |

## Ubicación de archivos de prueba

```
src/lib/
  validators.test.ts, invoice.test.ts, api.test.ts
src/test/setup.ts
App.a11y.test.tsx
tests/api/contract.test.ts, validate-openapi-response.ts
```

## Estrategia de mocks

- **HTTP (Axios):** `vi.mock('axios')` con `vi.hoisted()`.
- **APIs de navegador:** `localStorage`, `console.*` con `vi.spyOn` si hace falta.
- **Prisma:** en contrato API se mockea `PrismaClient`; no sustituye integración futura con PostgreSQL real en CI.

## Criterios de entrada y salida

**Entrada (ejecutar CI):** `tsc` sin errores; ESLint sin errores.

**Salida (CI OK):** todos los tests pasan; cobertura cumple umbrales; artefacto de cobertura subido.

## Regresiones

Ante un bug: 1) test que reproduzca; 2) falla en código actual; 3) corrección; 4) test pasa.

**Otros idiomas:** [English](../../en/quality/testing-strategy.md) · [Português](../../pt-br/quality/estrategia-testes.md)
