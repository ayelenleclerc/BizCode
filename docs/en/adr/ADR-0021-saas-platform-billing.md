# ADR-0021: Platform SaaS billing vs tenant payments

**Status:** Accepted  
**Date:** 2026-08-24  
**ISO reference:** ISO/IEC 12207:2017 §6.3.2 (software design)

---

## Context

Issue [#182](https://github.com/ayelenleclerc/BizCode/issues/182) requires charging BizCode **tenants** (subscriptions). [ADR-0019](ADR-0019-payments-multi-provider.md) already covers Mercado Pago for **tenant → customer** invoice checkout (`MercadoPagoConfig` per tenant). Mixing those credentials would charge the wrong party.

Options:

1. Reuse tenant `PaymentProviderAdapter` / `MercadoPagoConfig` for SaaS fees — incorrect payer.
2. **Platform Mercado Pago preapproval** with env credentials (`BIZCODE_SAAS_MP_*`) and dedicated Prisma `SaasSubscription` / `SaasInvoice` — chosen.
3. Stripe Billing live — out of scope; Stripe adapter remains unimplemented (ADR-0019).

## Decision

1. Platform billing lives under `apps/server/saas/` (`SaasBillingService`, `mpPreapprovalClient`), not `apps/server/payments/`.
2. Without `BIZCODE_SAAS_MP_ACCESS_TOKEN`, subscribe **mocks** activation (same fail-closed/mock pattern as Padrón in #180).
3. Live webhook requires `BIZCODE_SAAS_MP_WEBHOOK_SECRET` (header `x-bizcode-saas-webhook-secret`).
4. Prices come from existing `PLAN_CATALOG` / `PLAN_BASE_MONTHLY_ARS` (#181). No invented amounts.
5. AFIP e-invoice for SaaS charges is **not** in this ADR.

## Consequences

- **Positive:** Clear separation from customer collections; local Docker works without MP.
- **Negative:** Two Mercado Pago integrations (platform vs tenant) to operate.
- **Not evidenced:** Stripe subscriptions, AFIP for SaaS invoices, MP `x-signature` HMAC (simple shared secret used).

## References

- Issue #182
- [saas-platform-billing.md](../quality/saas-platform-billing.md)
- [ADR-0019](ADR-0019-payments-multi-provider.md)
