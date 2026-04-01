# ADR-0003: Pruebas de contrato HTTP frente a OpenAPI

## Estado

Aceptada

## Contexto

El plan de calidad ISO-ready exige **integración/contrato contra OpenAPI** para la API Express, con CI bloqueante y documentación de exclusiones.

## Decisión

1. **Refactor** de `server.ts`: la lógica HTTP vive en `server/createApp.ts` exportando `createApp(prisma)` para poder inyectar un `PrismaClient` mockeado en tests.
2. **Contrato**: `tests/api/contract.test.ts` usa **supertest** contra la app sin levantar puerto; las respuestas se validan con **Ajv** + **@apidevtools/swagger-parser** (spec dereferenciado) contra `docs/api/openapi.yaml`.
3. **OpenAPI** es la fuente de verdad del **forma** del JSON (sobre todo `success`/`data` y `error` en 500); se alineó el YAML con el comportamiento real de Express (`q` como query, `200` en POST, envelope `{ success, data }`).

## Consecuencias

- **Positivas:** divergencias spec ↔ implementación se detectan en CI; `server/createApp.ts` tiene cobertura 100% en el mismo umbral que `src/lib/**`.
- **Negativas:** mantener `openapi.yaml` cuando cambien rutas o formas de respuesta; los tests de contrato dependen de mocks de Prisma (no sustituyen pruebas E2E con PostgreSQL real).

## Referencias

- `tests/api/validate-openapi-response.ts`
- `tests/api/contract.test.ts`
- [quality/estrategia-pruebas.md](../quality/estrategia-pruebas.md) (alcance de cobertura)
