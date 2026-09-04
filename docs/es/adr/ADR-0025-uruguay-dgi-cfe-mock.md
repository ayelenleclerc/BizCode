# ADR-0025: CFE DGI Uruguay vía mock de homologación

- **Estado:** Aceptado
- **Fecha:** 2026-09-04
- **Issue:** [#207](https://github.com/ayelenleclerc/BizCode/issues/207)
- **Relacionados:** [ADR-0018](ADR-0018-fiscal-multi-organism-e-invoicing.md), [ADR-0023](ADR-0023-fiscal-rule-sets-by-country.md), [ADR-0024](ADR-0024-mexico-sat-cfdi-mock-pac.md)

## Contexto

El residual del issue #207 exige autorización de e-factura CFE en homologación para Uruguay. BizCode ya tiene ARCA y SAT México como **mocks de homologación**; SOAP/REST DGI live y certificados digitales **no están evidenciados** en el código actual.

## Decisión

1. Implementar `uruguay_dgi` como **mock CFE de homologación** en `apps/server/fiscal/uy/`.
2. Capacidades `implemented: true` con nota explícita de que DGI live no está evidenciado.
3. Persistencia de códigos sintéticos en campos CAE existentes de `Factura`/`NotaCredito`.
4. Módulo `billing.dgi_cfe` solo para `UY`.
5. `documentKinds` de producto (`e-Factura` / `e-NotaCredito`) — no el catálogo oficial DGI completo.
6. Sin cancelación en este mock (`supportsCancel: false`) hasta evidenciar contrato.
7. Cliente DGI live diferido a un ADR futuro.

## Consecuencias

- Positivo: se pueden verificar los AC de homologación en CI sin inventar HTTP/SOAP DGI.
- Negativo: la emisión productiva CFE sigue pendiente.
- Seguimiento: ADR de cliente DGI live cuando existan secretos; #207 puede quedar abierto por ese residual.
