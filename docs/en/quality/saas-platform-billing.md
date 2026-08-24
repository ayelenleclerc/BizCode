# SaaS platform billing (#182)

## Purpose

Documents how BizCode charges **tenants** for the SaaS product (platform → tenant), using Mercado Pago Suscripciones (`preapproval`) with a **mock** when platform credentials are absent.

**Evidence status:** Implemented in product code. Live Mercado Pago requires `BIZCODE_SAAS_MP_ACCESS_TOKEN`. AFIP e-invoicing for SaaS charges and Stripe live are residual. Not a certification claim.

This path is **not** tenant Mercado Pago (ADR-0019 / #377), which collects from the tenant’s own customers.

## Flow

1. Authenticated owner/manager opens `/configuracion/billing`.
2. `GET /api/tenant/billing` lists `SaasInvoice` rows and current `SaasSubscription`.
3. `POST /api/tenant/billing/subscribe` uses [`PLAN_CATALOG`](../../packages/types/src/plans-catalog.ts) prices:
   - no platform token, or plan price `0` → mock authorize + `saasStatus=active`
   - live token + paid plan → Mercado Pago preapproval `initPoint`
4. `POST /api/saas/billing/webhook` (public): mock unsigned JSON; live requires `x-bizcode-saas-webhook-secret` = `BIZCODE_SAAS_MP_WEBHOOK_SECRET` (fail-closed if token set but secret missing).
5. Failed payments increment `paymentRetryCount`; at 3 failures → `suspended_payment`. Job `npm run saas:billing-retries` also suspends after 7 days from last failure.
6. `suspended_payment` blocks `POST /api/facturas` (`403` `PAYMENT_SUSPENDED`) and the shell shows only the renew screen except `/configuracion/billing`.

## Environment

| Variable | Role |
|----------|------|
| `BIZCODE_SAAS_MP_ACCESS_TOKEN` | Platform MP token; unset → mock |
| `BIZCODE_SAAS_MP_WEBHOOK_SECRET` | Required in live mode for webhook |
| `BIZCODE_SAAS_MP_BACK_URL` | Optional preapproval `back_url` |

## Residual

- AFIP invoice per SaaS charge
- Stripe live
- Emails without SMTP
- Live preapproval without platform credentials

## Related

- [saas-self-service-onboarding.md](saas-self-service-onboarding.md) (#180)
- [ADR-0021](../adr/ADR-0021-saas-platform-billing.md)
- [ADR-0019](../adr/ADR-0019-payments-multi-provider.md)
- [product-vision-and-deployment.md](product-vision-and-deployment.md)
