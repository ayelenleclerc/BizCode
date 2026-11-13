# ADR-0028: FCEM MiPyME via mock de homologação WSFECM

- **Status:** Aceito
- **Data:** 2026-11-12
- **Issue:** [#239](https://github.com/ayelenleclerc/BizCode/issues/239)
- **Relacionados:** [ADR-0018](ADR-0018-fiscal-multi-organism-e-invoicing.md), [ADR-0014](ADR-0014-legal-arca-invoice-pdf.md)

## Contexto

A issue #239 exige Factura de Crédito Electrónica MiPyME (FCEM, Lei 27440) para emitentes argentinos: detecção quando o emitente é MiPyME, o comprador é RI, o valor atinge o limiar e o prazo de pagamento é ≥ 31 dias; emissão dos tipos 201/206/211; e aceitação / rejeição / aceitação tácita do receptor. WSFECM AFIP live, sincronização do catálogo MiPyME e ConsultaObligado **não estão evidenciados no código atual**. O suporte ARCA existente é mock WSFE apenas para tipos A/B/C (`arcaWsfeMock.ts`).

## Decisão

1. Entregar um **MVP local** sob o módulo `billing.fcem_mipyme` (`availableForCountries: ['AR']`, depende de `billing.arca_cae`).
2. Persistir estado FCEM em `Factura` e knobs MiPyME em `ParamEmpresa`.
3. Detecção pura em `@bizcode/types` (`evaluateFcemRequirement`) com limiar padrão configurável (sem tabela AFIP autoatualizada).
4. Mock de homologação `arcaWsfecmMock` + `FcemService` + `/api/fcem/facturas/*`.
5. Após rejeição mock bem-sucedida, notificar owners do tenant in-app (`fcem_rejected` via `notifyTenantOwners`); falha de notificação não deve falhar o HTTP de rejeição.
6. Não implementar WSFECM live nem jobs de aceitação tácita por calendário neste ADR.
7. Manter #239 **OPEN** para residual live AFIP / catálogo / ConsultaObligado.

## Consequências

- Positivo: é possível exercitar fluxos FCEM em CI e UI sem inventar HTTP AFIP live.
- Negativo: FCEM de produção contra AFIP ainda exige integração posterior; a documentação não deve afirmar WSFECM live.
- Seguimento: ADR de WSFECM live quando existirem credenciais de sandbox.
