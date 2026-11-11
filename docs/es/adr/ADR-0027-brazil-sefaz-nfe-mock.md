# ADR-0027: NF-e SEFAZ Brasil vía mock de homologación

- **Estado:** Aceptado
- **Fecha:** 2026-11-11
- **Issue:** [#211](https://github.com/ayelenleclerc/BizCode/issues/211)
- **Relacionado:** [ADR-0018](ADR-0018-fiscal-multi-organism-e-invoicing.md), [ADR-0023](ADR-0023-fiscal-rule-sets-by-country.md), [ADR-0026](ADR-0026-chile-sii-dte-mock.md)

## Contexto

El issue #211 requiere un camino de autorización NF-e para Brasil. BizCode ya entrega ARCA, SAT México, DGI Uruguay y SII Chile como **mocks de homologación**. SEFAZ SOAP/REST live, certificados ICP-Brasil, DANFE PDF y motores ICMS/Simples completos son **Not evidenced**. El modelo de dos buckets de `Factura` (`neto1`/`neto2`) no representa regímenes multi-impuesto brasileños sin rediseñar Prisma (#440).

## Decisión

1. Implementar `brazil_sefaz_nfe` como **mock NF-e de homologación** en `apps/server/fiscal/br/` (espejo CL).
2. Capacidades `implemented: true` con nota explícita de que SEFAZ live no está evidenciado.
3. Persistencia de códigos sintéticos en campos CAE existentes.
4. Módulo `billing.nfe_sefaz` (`availableForCountries: ['BR']`).
5. Jurisdicción `BR` con CNPJ, BRL y buckets de producto 18/12 (no la matriz real de ICMS).
6. `documentKinds` de producto (`55-NFe` / `NFe-Devolucao`).
7. Sin cancel en este mock (`supportsCancel: false`).
8. Diferir cliente SEFAZ live + certificados + DANFE + Simples/ICMS-ST/PIS/COFINS.

## Consecuencias

- Positivo: AC de emisión en homologación verificable en CI.
- Negativo: la emisión productiva sigue pendiente; la documentación no debe afirmar SEFAZ live ni cálculo tributario completo.
- Seguimiento: ADR live cuando existan credenciales de sandbox; #211 permanece OPEN por residuales.
