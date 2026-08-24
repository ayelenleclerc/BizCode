# ADR-0021: Billing SaaS de plataforma vs cobros del tenant

**Status:** Aceptado  
**Date:** 2026-08-24  
**ISO reference:** ISO/IEC 12207:2017 §6.3.2 (software design)

---

## Contexto

El issue [#182](https://github.com/ayelenleclerc/BizCode/issues/182) requiere cobrar a los **tenants** de BizCode. [ADR-0019](ADR-0019-payments-multi-provider.md) cubre Mercado Pago **tenant → cliente**. Mezclar credenciales cobraria a la parte equivocada.

Opciones:

1. Reutilizar `PaymentProviderAdapter` / `MercadoPagoConfig` del tenant — pagador incorrecto.
2. **Preapproval Mercado Pago de plataforma** con env (`BIZCODE_SAAS_MP_*`) y Prisma `SaasSubscription` / `SaasInvoice` — elegido.
3. Stripe Billing live — fuera de alcance.

## Decisión

1. El billing de plataforma vive en `apps/server/saas/`, no en `apps/server/payments/`.
2. Sin `BIZCODE_SAAS_MP_ACCESS_TOKEN`, el subscribe **mockea** la activación.
3. Webhook live exige `BIZCODE_SAAS_MP_WEBHOOK_SECRET`.
4. Precios de `PLAN_CATALOG` (#181).
5. AFIP por cobro SaaS no está en este ADR.

## Consecuencias

- Separación clara respecto de cobros a clientes; Docker local funciona sin MP.
- Dos integraciones MP (plataforma vs tenant).
- No evidenciado: Stripe live, AFIP SaaS, HMAC `x-signature` de MP.

## Referencias

- Issue #182
- [billing-saas-plataforma.md](../quality/billing-saas-plataforma.md)
- [ADR-0019](ADR-0019-payments-multi-provider.md)
