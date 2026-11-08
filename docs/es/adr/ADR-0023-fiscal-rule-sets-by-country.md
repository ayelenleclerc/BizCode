# ADR-0023: Registro de reglas fiscales por país

**Estado:** Aceptado  
**Fecha:** 2026-09-03  
**Referencia ISO:** ISO/IEC 12207:2017 §6.3.2 (diseño de software)

---

## Contexto

Los issues [#207](https://github.com/ayelenleclerc/BizCode/issues/207), [#437](https://github.com/ayelenleclerc/BizCode/issues/437) y [#208](https://github.com/ayelenleclerc/BizCode/issues/208) hicieron que la jurisdicción del tenant gobierne IVA, algoritmos de identificador fiscal, aplicabilidad de módulos y selección de adaptador. Una auditoría para [#440](https://github.com/ayelenleclerc/BizCode/issues/440) mostró que el resto de la legislación argentina seguía cableada en capas que se presentan como neutrales:

- Los esquemas Zod del servidor exigían CUIT/CBU argentinos y `RI|Mono|CF|Exento`.
- El motor de facturas decidía quién paga IVA comparando contra `CF` y `Exento`.
- Las etiquetas de IVA (`21%`, `10.5%`) y las letras `A|B|C` estaban en JSX y locales.
- Las exportaciones de Libro IVA colgaban de `finance.ledger` (no AR-only), y `echeq` era método genérico de recibo pese a que `fiscal.cheques` es AR-only.

[ADR-0007](ADR-0007-dual-deployment-and-fiscal-modularity.md) punto 3 y [ADR-0022](ADR-0022-legal-module-activation-by-jurisdiction.md) exigen comportamiento fiscal como capas por país, no condicionales dispersos.

Opciones consideradas:

1. Añadir `if (jurisdiction === 'AR')` alrededor de cada código argentino — dispersa legislación.
2. Mantener algoritmos en `apps/web` e importarlos desde el servidor por ruta relativa — dependencia invertida.
3. **Declarar un `FiscalRuleSet` por país bajo `packages/types/src/fiscal/` y que el núcleo lea el registro** — elegida.

## Decisión

1. Cada país posee un `FiscalRuleSet` en `packages/types/src/fiscal/countries/`.
2. `registry.ts` expone `getFiscalRules`, `subjectPaysVat`, `getVatRateCodes`, `getDocumentKinds`.
3. Algoritmos puros de identificador viven en `packages/types/src/fiscal/identifiers/` y se re-exportan desde `apps/web/src/lib/validators.ts`.
4. `validateBodyForTenant(prisma, buildSchema)` resuelve la jurisdicción del tenant y construye esquemas Zod por request (cliente, proveedor, empresa).
5. Los selects de UI se derivan del registro (`apps/web/src/lib/fiscal/uiOptions.ts`). `calculateInvoice` recibe la jurisdicción.
6. `fiscal.libro_iva` es AR-only; `echeq` solo se acepta en recibos de proveedor cuando `fiscal.cheques` está habilitado.
7. Las condiciones fiscales de UY y CL son **modelo de producto** (quién paga IVA), no catálogo oficial DGI/SII.

## Consecuencias

- Sumar una jurisdicción es mayormente declarativo.
- Los códigos argentinos persistidos siguen válidos; columnas Prisma siguen siendo `String`.
- Tenants AR que solo tenían `finance.ledger` necesitan `fiscal.libro_iva` para exportaciones Libro IVA.

## Relacionado

- Issue [#440](https://github.com/ayelenleclerc/BizCode/issues/440)
- [ADR-0007](ADR-0007-dual-deployment-and-fiscal-modularity.md), [ADR-0022](ADR-0022-legal-module-activation-by-jurisdiction.md)
- Guía: [conjuntos-reglas-fiscales-por-pais.md](../quality/conjuntos-reglas-fiscales-por-pais.md)
