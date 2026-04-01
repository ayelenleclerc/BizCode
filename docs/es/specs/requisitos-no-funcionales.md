# Requisitos no funcionales (MVP)

| Campo | Valor |
|-------|--------|
| Versión del documento | 0.1 |
| Revisión | 1 |
| Fecha | 2026-03-31 |
| Referencia al producto | BizCode 0.1.0 MVP |

| ID | Requisito | Evidencia |
|----|-----------|-----------|
| RNF-001 | **Accesibilidad:** política WCAG 2.2 **AA**; ESLint `jsx-a11y` (cero advertencias en CI) y smoke jest-axe. | [accesibilidad.md](../accesibilidad.md), `App.a11y.test.tsx` |
| RNF-002 | **i18n:** tres locales con paridad de claves; CI ante desvíos. | [estrategia-i18n.md](../estrategia-i18n.md), `scripts/check-i18n.ts` |
| RNF-003 | **Seguridad (escritorio):** API prevista para loopback; modelo de amenazas. | [seguridad.md](../seguridad.md) |
| RNF-004 | **Privacidad:** inventario de datos personales. | [mapa-datos-personales.md](../mapa-datos-personales.md) |
| RNF-005 | **Pruebas:** umbrales de cobertura en alcance acordado; pruebas de contrato vs OpenAPI. | [estrategia-pruebas.md](../quality/estrategia-pruebas.md), `vitest.config.ts`, `tests/api/contract.test.ts` |
| RNF-006 | **Calidad de código:** TypeScript estricto; reglas en `.cursor/rules/`. | [estandares-codigo.md](../estandares-codigo.md), [ADR-0003](../adr/ADR-0003-api-contract-testing.md) |

**Otros idiomas:** [English](../../en/specs/non-functional-requirements.md) · [Português](../../pt-br/specs/non-functional-requirements.md)
