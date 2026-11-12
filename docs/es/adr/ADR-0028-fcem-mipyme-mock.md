# ADR-0028: FCEM MiPyME vía mock de homologación WSFECM

- **Estado:** Aceptado
- **Fecha:** 2026-11-12
- **Issue:** [#239](https://github.com/ayelenleclerc/BizCode/issues/239)
- **Relacionados:** [ADR-0018](ADR-0018-fiscal-multi-organism-e-invoicing.md), [ADR-0014](ADR-0014-legal-arca-invoice-pdf.md)

## Contexto

El issue #239 requiere Factura de Crédito Electrónica MiPyME (FCEM, Ley 27440) para emisores argentinos: detección cuando el emisor es MiPyME, el comprador es RI, el monto alcanza el umbral y el plazo de pago es ≥ 31 días; emisión de tipos 201/206/211; y aceptación / rechazo / aceptación tácita del receptor. WSFECM AFIP live, sincronización del catálogo MiPyME y ConsultaObligado **no están evidenciados en el código actual**. El soporte ARCA existente es mock WSFE solo para tipos A/B/C (`arcaWsfeMock.ts`).

## Decisión

1. Entregar un **MVP local** bajo el módulo `billing.fcem_mipyme` (`availableForCountries: ['AR']`, depende de `billing.arca_cae`).
2. Persistir estado FCEM en `Factura` y knobs MiPyME en `ParamEmpresa`.
3. Detección pura en `@bizcode/types` (`evaluateFcemRequirement`) con umbral por defecto configurable (sin tabla AFIP auto-actualizada).
4. Mock de homologación `arcaWsfecmMock` + `FcemService` + `/api/fcem/facturas/*`.
5. No implementar WSFECM live ni jobs de aceptación tácita por calendario en este ADR.
6. Mantener #239 **OPEN** para residual live AFIP / catálogo / ConsultaObligado.

## Consecuencias

- Positivo: se pueden ejercitar flujos FCEM en CI y UI sin inventar HTTP AFIP live.
- Negativo: FCEM de producción contra AFIP sigue requiriendo integración posterior; la documentación no debe afirmar WSFECM live.
- Seguimiento: ADR de WSFECM live cuando existan credenciales de sandbox.
