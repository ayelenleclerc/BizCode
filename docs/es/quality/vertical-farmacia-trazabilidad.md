# Vertical farmacia — MVP de trazabilidad local (#204)

**Rol del documento:** guía de calidad de producto para la vertical farmacia (recetas, libro interno de psicotrópicos, captura de serial unitario).  
**Issue relacionado:** [#204](https://github.com/ayelenleclerc/BizCode/issues/204)

Este MVP es un **registro local auditable**. **No** afirma envío al Sistema Nacional de Trazabilidad (SNT) de ANMAT, formato oficial de presentación ante SEDRONAR, lector GS1/DataMatrix ni conformidad regulatoria. La revisión legal sigue pendiente, según exige el issue.

## Alcance (MVP)

| Ítem | Evidencia en el repo |
|------|----------------------|
| Gate de módulo | `vertical.pharmacy` en [`modules-catalog.ts`](../../../packages/types/src/modules-catalog.ts) (depende de `inventory.lots`); las rutas devuelven `403 MODULE_NOT_ENABLED` |
| Persistencia | Prisma `RecetaDispensacion`, `LibroPsicotropicoMovimiento`, `Articulo.requiereReceta`, `Articulo.esPsicotropico`, `Lote.serialUnidad`, `Lote.codigoDatamatrix` (migración `20260828120000_pharmacy_vertical_204`) |
| Lógica pura | [`farmaciaDispensingMath.ts`](../../../apps/server/services/farmaciaDispensingMath.ts) — normalización, gate de dispensación, cantidad firmada del libro, captura de serial, generador CSV |
| Orquestación | [`FarmaciaService.ts`](../../../apps/server/services/FarmaciaService.ts) |
| REST | [`registerFarmaciaRoutes.ts`](../../../apps/server/routes/registerFarmaciaRoutes.ts): `/api/farmacia/recetas`, `/api/farmacia/recetas/{id}`, `/api/farmacia/libro-psicotropicos`, `/api/farmacia/libro-psicotropicos/export`, `/api/farmacia/lotes/{id}/serial` |
| Gate de dispensación | [`FacturaService.create`](../../../apps/server/services/FacturaService.ts) rechaza con `422` cuando un artículo tiene `requiereReceta` y no se envía `recetaId` |
| UI | [`pages/farmacia/index.tsx`](../../../apps/web/src/pages/farmacia/index.tsx) (pestañas: recetas, libro, serial de lote) y toggles de farmacia en [`ArticuloForm.tsx`](../../../apps/web/src/pages/articulos/ArticuloForm.tsx) |
| i18n | `apps/web/src/locales/{en,es,pt-BR}/farmacia.json` |
| Pruebas | `tests/server/farmaciaDispensingMath.test.ts`, `tests/server/services/farmaciaService.test.ts`, `tests/api/farmacia.test.ts`, `packages/api-client/src/modules/farmacia.test.ts` |

## Flujo

1. Marcar el artículo como `requiereReceta` y/o `esPsicotropico` en la ficha (solo visible con el módulo habilitado).
2. Registrar la receta (`POST /api/farmacia/recetas`) con número, profesional, matrícula, fecha y cliente/factura opcionales.
3. Al facturar un artículo que exige receta, enviar `recetaId`; en caso contrario la factura se rechaza con un `422` accionable.
4. Los egresos de artículos psicotrópicos se asientan en `LibroPsicotropicoMovimiento` tras crear la factura, vinculados a la receta y al lote cuando existen.
5. El serial unitario / contenido DataMatrix se guarda tal cual en el lote; no se parsea.
6. El libro se exporta a CSV para auditoría interna.

## Fuera de alcance / residual

- Webservice SNT de ANMAT y ambiente de testing de ANMAT
- Formato oficial del reporte periódico de SEDRONAR
- Lectura de DataMatrix en móvil
- Cualquier afirmación de conformidad regulatoria sin revisión legal

## Relacionado

- Base de lotes / FEFO: `LoteService.ts`, módulos `inventory.lots` / `inventory.fefo`
- OpenAPI: `docs/api/openapi.yaml`, tag `farmacia`
- [ADR-0007](../../en/adr/ADR-0007-dual-deployment-and-fiscal-modularity.md) (modularidad vertical)
