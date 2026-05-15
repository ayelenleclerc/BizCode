# Casos de prueba manual (MVP)

| Campo | Valor |
|-------|--------|
| Versión del documento | 0.2 |
| Revisión | 2 |
| Fecha | 2026-05-15 |
| Referencia al producto | BizCode 0.1.0 MVP |

Ejecutar en un registro de sesión usando [certificacion-iso/plantillas-registros.md](../certificacion-iso/plantillas-registros.md) (plantilla de sesión de prueba manual).

| ID TC | Objetivo | Precondiciones | Pasos (resumen) | Resultado esperado | Evidencia |
|-------|----------|----------------|-----------------|---------------------|-----------|
| TC-001 | Búsqueda de clientes | Datos existentes o lista vacía | Abrir Clientes → buscar (F2) | Lista filtrada según implementación | `clientes/index` |
| TC-002 | CUIT inválido | Formulario cliente nuevo | Ingresar CUIT inválido | Mensaje de validación visible | `ClienteForm` + validadores |
| TC-003 | Lista de artículos | Al menos un artículo | Abrir Artículos | Tabla visible | `articulos/index` |
| TC-004 | Línea en factura | Formulario factura nueva | Ins / agregar línea | Nueva fila visible | `NuevaFacturaForm` |
| TC-005 | Guardar deshabilitado | Factura nueva | Sin ítems | Guardar deshabilitado | Lógica UI |
| TC-006 | Conmutar tema | Cualquier pantalla | Cambiar tema en barra lateral | Clase `<html>` y `localStorage` según temas | `Layout` |
| TC-007 | Cambio de idioma | Cualquier pantalla | Cambiar es → en → pt-BR | Textos de UI cambian; `check:i18n` pasa en CI | i18n |
| TC-008 | Salud API | Sidecar en ejecución | `GET /api/health` | JSON `{ status: ok }` | `createApp.ts` |
| TC-009 | Prueba de contrato | CI | `npm run test` incluye contrato API | Pasa | `tests/api/contract.test.ts` |
| TC-010 | Humo a11y | CI | `App.a11y.test.tsx` | Pasa jest-axe | `src/App.a11y.test.tsx` |
| TC-011 | Registrar cobro | Cliente activo; `sales.create` | Cobros → Nuevo cobro → guardar | Cobro en tabla; saldo actualizado | `cobros/`, `tests/api/cobros.test.ts` |
| TC-012 | Filtrar cobros | Al menos un cobro | Cliente id + fechas → Filtrar | Lista coincide con filtros | `cobros/index` |
| TC-013 | Antigüedad CxC | `reports.financial.read` | Abrir Finanzas | Buckets visibles | `finanzas/index` |
| TC-014 | Exportar CSV reporte | Pestaña con datos | Control Exportar CSV | Descarga de archivo | `reportes/index` |
| TC-015 | Lista órdenes entrega | `logistics.read` | Abrir Logística → filtrar fecha | Tabla de órdenes carga | `logistica/index` |

**Otros idiomas:** [English](../../en/specs/manual-test-cases.md) · [Português](../../pt-br/specs/casos-de-teste-manual.md)
