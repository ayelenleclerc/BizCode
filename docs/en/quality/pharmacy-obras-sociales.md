# Pharmacy vertical — insurers / prepaid plans (#252)

**Document role:** Product quality guide for obra social / prepaid pharmacy sales.  
**Related issue:** [#252](https://github.com/ayelenleclerc/BizCode/issues/252)

Local MVP on module `vertical.pharmacy`. It does **not** call PAMI/Farmalink web services or emit proprietary OSDE/Swiss filing formats. Presentation export is an **internal CSV**.

## Scope (MVP)

| Item | Evidence |
|------|----------|
| Persistence | Prisma `ObraSocial`, `CoberturaOS`, `VentaConOS`, `VentaOSItem`, `PresentacionOS`, `PresentacionOSRechazo` (migration `20261117120000_obras_sociales_252`) |
| Pure logic | [`obraSocialMath.ts`](../../../apps/server/services/obraSocialMath.ts) |
| Orchestration | [`ObraSocialService.ts`](../../../apps/server/services/ObraSocialService.ts) |
| REST | [`registerObraSocialRoutes.ts`](../../../apps/server/routes/registerObraSocialRoutes.ts) under `/api/farmacia/...` |
| UI | [`ObrasSocialesPanels.tsx`](../../../apps/web/src/pages/farmacia/ObrasSocialesPanels.tsx) |
| Tests | `tests/server/obraSocialMath.test.ts`, `tests/api/obras-sociales.test.ts` |

## Flow

1. Register insurer + coverage % by product type.
2. Create OS sale → automatic copay / insurer credit.
3. Generate monthly presentation → mark sales `presentado` → export CSV.
4. Register partial rejections and cobro; consult CC summary.

## Out of scope / residual

- Live PAMI/Farmalink, proprietary OSDE/Swiss formats, remote PAMI formulary
- Closing #252 until product accepts residuals or extends live integrations

## Related

- Pharmacy MVP #204: [pharmacy-vertical-traceability.md](pharmacy-vertical-traceability.md)
