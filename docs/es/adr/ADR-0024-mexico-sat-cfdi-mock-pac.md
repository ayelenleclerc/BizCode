# ADR-0024: CFDI SAT México vía mock PAC de homologación

- **Estado:** Aceptado
- **Fecha:** 2026-09-04
- **Issue:** [#210](https://github.com/ayelenleclerc/BizCode/issues/210)
- **Relacionados:** [ADR-0018](ADR-0018-fiscal-multi-organism-e-invoicing.md), [ADR-0023](ADR-0023-fiscal-rule-sets-by-country.md)

## Contexto

El issue #210 exige timbrado CFDI 4.0 vía PAC, catálogos SAT buscables y cancelación con motivos 01–04. El único adapter fiscal funcional es ARCA, con **mock de homologación**.

Las APIs PAC comerciales no están evidenciadas en el repositorio.

## Decisión

1. Implementar `mexico_sat_pac` como **mock PAC de homologación** en `apps/server/fiscal/mx/`.
2. Capacidades `implemented: true` con nota explícita de que el REST PAC/SAT live no está evidenciado.
3. Persistencia de `SatCatalogEntry` (subconjunto) y `GET /api/fiscal/sat/catalog`.
4. Extender `cancel` con `reasonCode` 01–04.
5. Módulo `billing.cfdi_sat` solo para `MX`.
6. Facturama/Finkok live diferido a un ADR futuro.

## Consecuencias

- Positivo: se pueden verificar los AC de pruebas en CI sin inventar HTTP PAC.
- Negativo: la emisión productiva CFDI sigue pendiente.
- Seguimiento: ADR de cliente PAC live cuando existan secretos.
