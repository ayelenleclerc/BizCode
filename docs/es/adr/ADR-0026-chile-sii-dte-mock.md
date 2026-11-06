# ADR-0026: DTE SII Chile vía mock de homologación

- **Estado:** Aceptado
- **Fecha:** 2026-10-28
- **Issue:** [#208](https://github.com/ayelenleclerc/BizCode/issues/208)
- **Relacionados:** [ADR-0018](ADR-0018-fiscal-multi-organism-e-invoicing.md), [ADR-0023](ADR-0023-fiscal-rule-sets-by-country.md), [ADR-0025](ADR-0025-uruguay-dgi-cfe-mock.md)

## Contexto

El residual del issue #208 exige autorización DTE en homologación para Chile. BizCode ya tiene ARCA, SAT México y DGI Uruguay como **mocks de homologación**; SOAP/XML XAdES SII live y certificados **no están evidenciados**.

## Decisión

1. Implementar `chile_sii` como **mock DTE de homologación** en `apps/server/fiscal/cl/`.
2. Capacidades `implemented: true` con nota explícita de que SII live no está evidenciado.
3. Persistencia de códigos sintéticos en campos CAE existentes.
4. Módulo `billing.dte_sii` solo para `CL`.
5. `documentKinds` de producto (`33-FacturaAfecta` / `61-NotaCredito`) — códigos citados por el AC de #208.
6. Sin cancelación (`supportsCancel: false`).
7. Cliente SII live diferido a un ADR futuro.

## Consecuencias

- Positivo: se pueden verificar los AC de homologación en CI sin inventar HTTP/XML SII.
- Negativo: la emisión productiva DTE sigue pendiente.
- Seguimiento: ADR de cliente SII live cuando existan secretos; #208 puede quedar abierto por ese residual.
