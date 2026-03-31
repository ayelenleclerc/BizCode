# Casos de prueba manual (MVP)

| Campo | Valor |
|-------|--------|
| Versión del documento | 0.1 |
| Revisión | 1 |
| Fecha | 2026-03-31 |
| Referencia al producto | BizCode 0.1.0 MVP |

Registrar la sesión con [quality/plantillas-registros.md](../quality/plantillas-registros.md).

| ID | Objetivo | Pasos (resumen) | Resultado esperado | Evidencia |
|----|----------|-----------------|---------------------|-----------|
| TC-001 | Búsqueda clientes | Clientes → buscar (F2) | Lista filtrada | `clientes/index` |
| TC-002 | CUIT inválido | Formulario nuevo cliente | Mensaje de error | Validadores |
| TC-003 | Lista artículos | Abrir Artículos | Tabla visible | `articulos/index` |
| TC-004 | Ítem en factura | Nueva factura → agregar línea | Nueva fila | `NuevaFacturaForm` |
| TC-005 | Guardar deshabilitado | Sin ítems | Guardar deshabilitado | UI |
| TC-006 | Tema | Conmutar tema | `localStorage` y `<html>` | `temas-interfaz.md` |
| TC-007 | Idioma | Cambiar es→en→pt-BR | Textos cambian | i18n |
| TC-008 | Health API | `GET /api/health` | `{ status: ok }` | `createApp.ts` |
| TC-009 | Contrato API | CI `npm run test` | Pasa contrato | `tests/api/contract.test.ts` |
| TC-010 | A11y smoke | CI | jest-axe pasa | `App.a11y.test.tsx` |

**Otros idiomas:** [English](../../en/specs/manual-test-cases.md) · [Português](../../pt-br/specs/manual-test-cases.md)
