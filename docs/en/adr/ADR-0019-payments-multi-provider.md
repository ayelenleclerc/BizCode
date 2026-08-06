# ADR-0019: Multi-provider payments module (Mercado Pago as first adapter)

**Status:** Accepted  
**Date:** 2026-08-06  
**ISO reference:** ISO/IEC 12207:2017 §6.3.2 (software design); ISO 9001:2015 §8.3.3 (design outputs)

---

## Context

BizCode collects online payments through Mercado Pago (`MercadoPago*Service`, `mercadoPagoApiClient.ts`), consumed directly by factura preference/QR routes, webhooks, refunds, reconciliation and chargebacks. Product strategy (issue #377, [ADR-0007](ADR-0007-dual-deployment-and-fiscal-modularity.md), [product-vision-and-deployment.md](../quality/product-vision-and-deployment.md)) targets additional PSPs (Payway, Stripe, and others named in the issue) without scattering `if (provider === …)` checks across domain services.

Options considered:

1. **Keep Mercado Pago as a standalone, ad-hoc implementation** and bolt on PSP-specific code paths later — fast now, but duplicates the modularity anti-pattern ADR-0007 already rules out for fiscal code.
2. **Extract a provider-agnostic contract (adapter pattern), with Mercado Pago as the first and only implemented adapter, and capability-only stubs for future providers** — mirrors [ADR-0018](ADR-0018-fiscal-multi-organism-e-invoicing.md) and the ecommerce `connectorRegistry` pattern.

## Decision

1. **`PaymentProviderAdapter` contract** (`apps/server/payments/PaymentProviderAdapter.ts`): `validateConfiguration`, `createPayment`, `getPaymentStatus`, optional `refundPayment` / `healthCheck`, `parseWebhook`, and `getCapabilities()`. Provider codes (`PaymentProviderCode`, `apps/server/payments/types.ts`): `mercadopago`, `payway`, `stripe`.
2. **Registry + bootstrap** (`paymentProviderRegistry.ts`, `bootstrapPaymentProviders.ts`) mirror fiscal/ecommerce registries: adapter factories keyed by provider code, closed `switch` for CodeQL, idempotent bootstrap, test-only reset helpers.
3. **`MercadoPagoPaymentAdapter`** wraps existing `MercadoPago{Config,Preference,Refund,Webhook}Service` — **no second HTTP client**; every call delegates to services that already use `mercadoPagoApiClient`. `getCapabilities()` reports `implemented: true`.
4. **Capability-only stubs** for `payway` and `stripe`: `implemented: false`; operational methods throw `PaymentAdapterNotImplementedError` instead of inventing PSP behavior that is **Not evidenced in current codebase**.
5. **Prisma:** `PaymentProviderConfig` (per-tenant, `@@unique([tenantId, providerCode])`, `encryptedConfig` via `encryptFiscalSecret`). Legacy `MercadoPagoConfig` and Factura `mp*` fields are **kept** (dual-read/write for config; no dual-write payment transaction table). Backfill: `scripts/migrate-payment-provider-config-377.ts`; verify: `scripts/verify-payment-provider-migration.ts`.
6. **Services:** `PaymentProviderConfigService`, `PaymentService`, `PaymentWebhookService` (thin facade — ReciboCobro effects stay in `MercadoPagoWebhookService`).
7. **Routes:** `registerPaymentRoutes.ts` (`/api/payments/providers/*`, `/api/payments/invoices/{facturaId}/checkout`). Legacy `/api/configuracion/mercadopago`, `/api/facturas/:id/mp/*`, `/api/webhooks/mercadopago` remain as compat aliases that delegate into the module.
8. **UI:** `PaymentProviderSection.tsx` lists registered providers and mounts `MercadoPagoConfigSection` for live credentials (gated by integration `mercadopago`).

## Consequences

- **Positive:** Mercado Pago becomes one interchangeable adapter; adding a real Payway/Stripe client later means implementing `PaymentProviderAdapter` and registering a factory, without touching Factura domain wiring outside the payments module; stubs degrade with HTTP 501.
- **Negative:** Extra indirection for checkout; two config sources until every tenant is migrated and `MercadoPagoConfig` is deprecated in a future ADR.
- **Not evidenced in current codebase:** live Payway, Fiserv, Getnet, or Stripe clients. Only Mercado Pago’s existing integration is evidenced.
- **Follow-up:** a future ADR is required before removing `MercadoPagoConfig` dual-read or implementing a real non-MP adapter.

## References

- Issue #377
- [ADR-0007: Dual deployment and fiscal modularity](ADR-0007-dual-deployment-and-fiscal-modularity.md)
- [ADR-0018: Multi-organism fiscal e-invoicing](ADR-0018-fiscal-multi-organism-e-invoicing.md)
- [Payments multi-provider inventory (#377)](../quality/payments-multi-provider-inventory-377.md)
- [How to add a payment provider adapter](../guides/how-to-add-a-payment-adapter.md)
- [product-vision-and-deployment.md](../quality/product-vision-and-deployment.md) (PROD-VISION-001)
