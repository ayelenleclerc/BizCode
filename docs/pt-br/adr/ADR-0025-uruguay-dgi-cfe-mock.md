# ADR-0025: CFE DGI Uruguai via mock de homologação

- **Status:** Aceito
- **Data:** 2026-09-04
- **Issue:** [#207](https://github.com/ayelenleclerc/BizCode/issues/207)
- **Relacionados:** [ADR-0018](ADR-0018-fiscal-multi-organism-e-invoicing.md), [ADR-0023](ADR-0023-fiscal-rule-sets-by-country.md), [ADR-0024](ADR-0024-mexico-sat-cfdi-mock-pac.md)

## Contexto

O residual do issue #207 exige autorização de e-fatura CFE em homologação para o Uruguai. O BizCode já possui ARCA e SAT México como **mocks de homologação**; SOAP/REST DGI live e certificados digitais **não estão evidenciados** no código atual.

## Decisão

1. Implementar `uruguay_dgi` como **mock CFE de homologação** em `apps/server/fiscal/uy/`.
2. Capacidades `implemented: true` com nota explícita de que DGI live não está evidenciado.
3. Persistência de códigos sintéticos nos campos CAE existentes de `Factura`/`NotaCredito`.
4. Módulo `billing.dgi_cfe` apenas para `UY`.
5. `documentKinds` de produto (`e-Factura` / `e-NotaCredito`) — não o catálogo oficial DGI completo.
6. Sem cancelamento neste mock (`supportsCancel: false`) até evidenciar contrato.
7. Cliente DGI live adiado para um ADR futuro.

## Consequências

- Positivo: os AC de homologação podem ser verificados no CI sem inventar HTTP/SOAP DGI.
- Negativo: a emissão produtiva CFE continua pendente.
- Acompanhamento: ADR de cliente DGI live quando existirem segredos; #207 pode permanecer aberto por esse residual.
