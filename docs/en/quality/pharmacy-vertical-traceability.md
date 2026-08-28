# Pharmacy vertical — MVP local traceability (#204)

**Document role:** Product quality guide for the pharmacy vertical (prescriptions, internal psychotropic book, unit serial capture).  
**Related issue:** [#204](https://github.com/ayelenleclerc/BizCode/issues/204)

This MVP is a **local auditable record**. It does **not** claim ANMAT National Traceability System (SNT) submission, an official SEDRONAR filing format, a GS1/DataMatrix scanner, or regulatory compliance. Legal review is still pending, as required by the issue.

## Scope (MVP)

| Item | Evidence in repo |
|------|------------------|
| Module gate | `vertical.pharmacy` in [`modules-catalog.ts`](../../../packages/types/src/modules-catalog.ts) (depends on `inventory.lots`); routes return `403 MODULE_NOT_ENABLED` |
| Persistence | Prisma `RecetaDispensacion`, `LibroPsicotropicoMovimiento`, `Articulo.requiereReceta`, `Articulo.esPsicotropico`, `Lote.serialUnidad`, `Lote.codigoDatamatrix` (migration `20260828120000_pharmacy_vertical_204`) |
| Pure logic | [`farmaciaDispensingMath.ts`](../../../apps/server/services/farmaciaDispensingMath.ts) — normalization, dispensing gate, signed book quantity, serial capture, CSV builder |
| Orchestration | [`FarmaciaService.ts`](../../../apps/server/services/FarmaciaService.ts) |
| REST | [`registerFarmaciaRoutes.ts`](../../../apps/server/routes/registerFarmaciaRoutes.ts): `/api/farmacia/recetas`, `/api/farmacia/recetas/{id}`, `/api/farmacia/libro-psicotropicos`, `/api/farmacia/libro-psicotropicos/export`, `/api/farmacia/lotes/{id}/serial` |
| Dispensing gate | [`FacturaService.create`](../../../apps/server/services/FacturaService.ts) rejects with `422` when an article has `requiereReceta` and no `recetaId` is supplied |
| UI | [`pages/farmacia/index.tsx`](../../../apps/web/src/pages/farmacia/index.tsx) (tabs: prescriptions, book, lot serial) and pharmacy toggles in [`ArticuloForm.tsx`](../../../apps/web/src/pages/articulos/ArticuloForm.tsx) |
| i18n | `apps/web/src/locales/{en,es,pt-BR}/farmacia.json` |
| Tests | `tests/server/farmaciaDispensingMath.test.ts`, `tests/server/services/farmaciaService.test.ts`, `tests/api/farmacia.test.ts`, `packages/api-client/src/modules/farmacia.test.ts` |

## Flow

1. Flag the article as `requiereReceta` and/or `esPsicotropico` in the article form (only visible with the module enabled).
2. Register the prescription (`POST /api/farmacia/recetas`) with number, prescriber, license, date, and optional customer/invoice.
3. When invoicing an article that requires a prescription, send `recetaId`; otherwise the invoice is rejected with an actionable `422`.
4. Outflows of psychotropic articles are booked in `LibroPsicotropicoMovimiento` after invoice creation, linked to the prescription and lot when available.
5. Unit serial / DataMatrix payload is stored verbatim on the lot; it is not parsed.
6. The book is exportable as CSV for internal audit.

## Out of scope / residual

- ANMAT SNT web service and ANMAT testing environment
- Official periodic SEDRONAR report format
- DataMatrix scanning on mobile
- Any statement of regulatory compliance without legal review

## Related

- Lots / FEFO base: `LoteService.ts`, modules `inventory.lots` / `inventory.fefo`
- OpenAPI: `docs/api/openapi.yaml`, tag `farmacia`
- [ADR-0007](../adr/ADR-0007-dual-deployment-and-fiscal-modularity.md) (vertical modularity)
