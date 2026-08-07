# ADR-0019: Multi-provider payments module (Mercado Pago as first adapter)

**Status:** Accepted (amended 2026-08-07: `PaymentTransaction` ledger + DoD closure #377)  
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
5. **Prisma:** `PaymentProviderConfig` (per-tenant, `@@unique([tenantId, providerCode])`, `encryptedConfig` via `encryptFiscalSecret`). Legacy `MercadoPagoConfig` and Factura `mp*` fields are **kept** (dual-read/write for config). Backfill: `scripts/migrate-payment-provider-config-377.ts`; verify: `scripts/verify-payment-provider-migration.ts`.
6. **Prisma ledger `PaymentTransaction`:** per-tenant payment attempts with `@@unique([tenantId, idempotencyKey])` (key form `{provider}:factura:{id}`), optional links to `Factura` / `ReciboCobro`, normalized `status` aligned with `apps/server/payments/types.ts`. Checkout creation **upserts** the ledger; active checkout is **idempotent** (returns the existing preference/link, no empty 409). Webhook / refund paths **sync** ledger status. Dual-write continues to `Factura.mp*` and `MercadoPagoProcessedPayment` until a future cut-over ADR.
7. **Services:** `PaymentProviderConfigService` (incl. `enabled` / single `isDefault` per tenant), `PaymentTransactionService`, `PaymentService`, `PaymentWebhookService` (thin facade — ReciboCobro effects stay in `MercadoPagoWebhookService`).
8. **Routes:** `registerPaymentRoutes.ts` (`/api/payments/providers/*`, checkout, status, refund, `PATCH …/providers/config`). Legacy `/api/configuracion/mercadopago`, `/api/facturas/:id/mp/*`, `/api/webhooks/mercadopago` remain as compat aliases (`deprecated: true` in OpenAPI) that delegate create/checkout into `PaymentService`.
9. **UI:** `PaymentProviderSection.tsx` lists providers, default/enable actions, and mounts `MercadoPagoConfigSection` for live credentials (gated by integration `mercadopago`). Invoice payment-link modal creates checkout via `paymentsAPI.createCheckout`.

## Consequences

- **Positive:** Mercado Pago becomes one interchangeable adapter; ledger + idempotency unlock multi-provider checkout without inventing PSP behavior; stubs degrade with HTTP 501; legacy OpenAPI paths remain until cut-over.
- **Negative:** Extra indirection for checkout; dual-write (`PaymentTransaction` ↔ `Factura.mp*` ↔ `MercadoPagoProcessedPayment` / `MercadoPagoConfig`) increases inconsistency risk until verify scripts and a cut-over ADR retire legacy surfaces.
- **Not evidenced in current codebase:** live Payway, Fiserv, Getnet, or Stripe clients. Only Mercado Pago’s existing integration is evidenced.
- **Follow-up:** a future ADR is required before removing `MercadoPagoConfig`, Factura `mp*` columns, or implementing a real non-MP adapter.

## References

- Issue #377
- [ADR-0007: Dual deployment and fiscal modularity](ADR-0007-dual-deployment-and-fiscal-modularity.md)
- [ADR-0018: Multi-organism fiscal e-invoicing](ADR-0018-fiscal-multi-organism-e-invoicing.md)
- [Payments multi-provider inventory (#377)](../quality/payments-multi-provider-inventory-377.md)
- [How to add a payment provider adapter](../guides/how-to-add-a-payment-adapter.md)
- [product-vision-and-deployment.md](../quality/product-vision-and-deployment.md) (PROD-VISION-001)
