# ADR-0027: NF-e SEFAZ Brasil via mock de homologação

- **Status:** Aceito
- **Data:** 2026-11-11
- **Issue:** [#211](https://github.com/ayelenleclerc/BizCode/issues/211)
- **Relacionado:** [ADR-0018](ADR-0018-fiscal-multi-organism-e-invoicing.md), [ADR-0023](ADR-0023-fiscal-rule-sets-by-country.md), [ADR-0026](ADR-0026-chile-sii-dte-mock.md)

## Contexto

O issue #211 exige um caminho de autorização NF-e para o Brasil. O BizCode já entrega ARCA, SAT México, DGI Uruguai e SII Chile como **mocks de homologação**. SEFAZ SOAP/REST live, certificados ICP-Brasil, DANFE PDF e motores ICMS/Simples completos são **Not evidenced**. O modelo de dois buckets de `Factura` (`neto1`/`neto2`) não representa regimes multi-imposto brasileiros sem redesenhar o Prisma (#440).

## Decisão

1. Implementar `brazil_sefaz_nfe` como **mock NF-e de homologação** em `apps/server/fiscal/br/` (espelho CL).
2. Capacidades `implemented: true` com nota explícita de que SEFAZ live não está evidenciado.
3. Persistência de códigos sintéticos nos campos CAE existentes.
4. Módulo `billing.nfe_sefaz` (`availableForCountries: ['BR']`).
5. Jurisdição `BR` com CNPJ, BRL e buckets de produto 18/12 (não a matriz real de ICMS).
6. `documentKinds` de produto (`55-NFe` / `NFe-Devolucao`).
7. Sem cancel neste mock (`supportsCancel: false`).
8. Adiar cliente SEFAZ live + certificados + DANFE + Simples/ICMS-ST/PIS/COFINS.

## Consequências

- Positivo: AC de emissão em homologação verificável no CI.
- Negativo: emissão produtiva permanece pendente; a documentação não deve afirmar SEFAZ live nem cálculo tributário completo.
- Acompanhamento: ADR live quando houver credenciais de sandbox; #211 permanece OPEN pelos residuais.
