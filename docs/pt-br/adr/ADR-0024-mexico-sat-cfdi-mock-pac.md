# ADR-0024: CFDI SAT México via mock PAC de homologação

- **Status:** Aceito
- **Data:** 2026-09-04
- **Issue:** [#210](https://github.com/ayelenleclerc/BizCode/issues/210)
- **Relacionados:** [ADR-0018](ADR-0018-fiscal-multi-organism-e-invoicing.md), [ADR-0023](ADR-0023-fiscal-rule-sets-by-country.md)

## Contexto

O issue #210 exige timbramento CFDI 4.0 via PAC, catálogos SAT pesquisáveis e cancelamento com motivos 01–04. O único adapter fiscal funcional é o ARCA, com **mock de homologação**.

APIs PAC comerciais não estão evidenciadas no repositório.

## Decisão

1. Implementar `mexico_sat_pac` como **mock PAC de homologação** em `apps/server/fiscal/mx/`.
2. Capacidades `implemented: true` com nota explícita de que REST PAC/SAT live não está evidenciado.
3. Persistência de `SatCatalogEntry` (subconjunto) e `GET /api/fiscal/sat/catalog`.
4. Estender `cancel` com `reasonCode` 01–04.
5. Módulo `billing.cfdi_sat` apenas para `MX`.
6. Facturama/Finkok live adiado para ADR futuro.

## Consequências

- Positivo: AC de ambiente de testes verificáveis no CI sem inventar HTTP PAC.
- Negativo: emissão produtiva CFDI permanece pendente.
- Seguimento: ADR de cliente PAC live quando houver segredos.
