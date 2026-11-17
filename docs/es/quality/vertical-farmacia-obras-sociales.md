# Vertical farmacia — obras sociales / prepagas (#252)

**Rol del documento:** Guía de calidad del producto para ventas de farmacia con obra social / prepaga.  
**Issue relacionado:** [#252](https://github.com/ayelenleclerc/BizCode/issues/252)

MVP local sobre el módulo `vertical.pharmacy`. **No** llama webservices PAMI/Farmalink ni emite formatos propietarios OSDE/Swiss. La exportación de presentación es un **CSV interno**.

## Alcance (MVP)

| Ítem | Evidencia |
|------|-----------|
| Persistencia | Prisma `ObraSocial`, `CoberturaOS`, `VentaConOS`, `VentaOSItem`, `PresentacionOS`, `PresentacionOSRechazo` (migración `20261117120000_obras_sociales_252`) |
| Lógica pura | [`obraSocialMath.ts`](../../../apps/server/services/obraSocialMath.ts) |
| Orquestación | [`ObraSocialService.ts`](../../../apps/server/services/ObraSocialService.ts) |
| REST | [`registerObraSocialRoutes.ts`](../../../apps/server/routes/registerObraSocialRoutes.ts) bajo `/api/farmacia/...` |
| UI | [`ObrasSocialesPanels.tsx`](../../../apps/web/src/pages/farmacia/ObrasSocialesPanels.tsx) |
| Pruebas | `tests/server/obraSocialMath.test.ts`, `tests/api/obras-sociales.test.ts` |

## Flujo

1. Alta de OS + % de cobertura por tipo de producto.
2. Venta OS → copago / crédito calculados automáticamente.
3. Presentación mensual → ventas `presentado` → export CSV.
4. Rechazos parciales y cobro; consulta de cuenta corriente.

## Fuera de alcance / residual

- PAMI/Farmalink live, formatos propietarios OSDE/Swiss, vademécum remoto PAMI
- Cierre de #252 hasta aceptar residuales o extender integraciones live

## Relacionado

- MVP farmacia #204: [vertical-farmacia-trazabilidad.md](vertical-farmacia-trazabilidad.md)
