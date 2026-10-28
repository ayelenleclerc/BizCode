# ADR-0026: DTE SII Chile via mock de homologação

- **Status:** Aceito
- **Data:** 2026-10-28
- **Issue:** [#208](https://github.com/ayelenleclerc/BizCode/issues/208)
- **Relacionados:** [ADR-0018](ADR-0018-fiscal-multi-organism-e-invoicing.md), [ADR-0023](ADR-0023-fiscal-rule-sets-by-country.md), [ADR-0025](ADR-0025-uruguay-dgi-cfe-mock.md)

## Contexto

O residual do issue #208 exige autorização DTE em homologação para o Chile. O BizCode já possui ARCA, SAT México e DGI Uruguai como **mocks de homologação**; SOAP/XML XAdES SII live e certificados **não estão evidenciados**.

## Decisão

1. Implementar `chile_sii` como **mock DTE de homologação** em `apps/server/fiscal/cl/`.
2. Capacidades `implemented: true` com nota explícita de que SII live não está evidenciado.
3. Persistência de códigos sintéticos nos campos CAE existentes.
4. Módulo `billing.dte_sii` apenas para `CL`.
5. `documentKinds` de produto (`33-FacturaAfecta` / `61-NotaCredito`) — códigos citados pelo AC de #208.
6. Sem cancelamento (`supportsCancel: false`).
7. Cliente SII live adiado para um ADR futuro.

## Consequências

- Positivo: os AC de homologação podem ser verificados no CI sem inventar HTTP/XML SII.
- Negativo: a emissão produtiva DTE continua pendente.
- Acompanhamento: ADR de cliente SII live quando existirem segredos; #208 pode permanecer aberto por esse residual.
