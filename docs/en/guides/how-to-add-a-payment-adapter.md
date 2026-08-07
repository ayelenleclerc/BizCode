# How to add a payment provider adapter (#377, ADR-0019)

This guide is for adding a new PSP adapter (e.g. a real Payway or Stripe client) to the multi-provider payments module introduced in [ADR-0019](../adr/ADR-0019-payments-multi-provider.md). It reflects the code as implemented; it does not describe hypothetical future behavior.

## 1. Add the provider code

Add the new code to `PAYMENT_PROVIDER_CODES` in [`apps/server/payments/types.ts`](../../../apps/server/payments/types.ts).

## 2. Implement `PaymentProviderAdapter`

Create `apps/server/payments/<provider>/<Provider>PaymentAdapter.ts` implementing [`PaymentProviderAdapter`](../../../apps/server/payments/PaymentProviderAdapter.ts):

- `validateConfiguration(tenantId)` — checks stored credentials exist; never returns secrets.
- `createPayment(input)` — creates a checkout preference / payment link; maps to `CreatePaymentResult`.
- `getPaymentStatus(tenantId, invoiceId, externalPaymentId?)` — reads current status.
- Optional `refundPayment` / `healthCheck` when the provider supports them.
- `parseWebhook(tenantId, request)` — validates authenticity and normalizes the event.
- `getCapabilities()` — set `implemented: true` **only** once a real (or officially documented sandbox) client exists.

Use `apps/server/payments/mercadopago/MercadoPagoPaymentAdapter.ts` as the reference — it **wraps** existing `MercadoPago*Service` / `mercadoPagoApiClient` instead of creating a second HTTP client.

## 3. Replace the capability stub

Until step 2 is real, keep the stub under `apps/server/payments/stubs/` (`PaywayPaymentAdapter.ts`, `StripePaymentAdapter.ts`), which throws [`PaymentAdapterNotImplementedError`](../../../apps/server/payments/stubs/PaymentAdapterNotImplementedError.ts). Once the real adapter exists, update the factory registration to use it instead of the stub.

## 4. Register the adapter factory

In [`bootstrapPaymentProviders.ts`](../../../apps/server/payments/bootstrapPaymentProviders.ts), call `registerPaymentProviderAdapterFactory(provider, (prisma) => new YourPaymentAdapter(prisma))`. Add a `case` in the closed `switch` inside `getPaymentProviderAdapter`.

## 5. Prisma / config secrets

Reuse `PaymentProviderConfig`: store under `providerCode = '<provider>'`, `encryptedConfig` via `encryptFiscalSecret` / `decryptFiscalSecret`. Do not add provider-specific plaintext secret columns.

Checkout attempts are persisted in `PaymentTransaction` by `PaymentService` / `PaymentTransactionService` using `idempotencyKey = '{provider}:factura:{invoiceId}'`. Adapters should not invent a second ledger table; map provider ids into the existing ledger fields (`externalPaymentId`, `preferenceId`, `checkoutUrl`, normalized `status`).

## 6. Routes / UI / OpenAPI

No new routes are required for basic status/validate/checkout/refund/flags: `registerPaymentRoutes.ts` and `PaymentProviderSection.tsx` read from `getCapabilities()` / `PaymentProviderConfigService`. Update `docs/api/openapi.yaml` `PaymentProviderCode` enum if you added a new code.

## 7. Tests

Mirror `tests/server/payments/mercadopago/mercadoPagoPaymentAdapter.test.ts` and remove the stub case from `tests/server/payments/stubs/paymentStubs.test.ts` once replaced. Do not lower coverage thresholds.

## 8. Documentation

Update this guide's provider table and [ADR-0019](../adr/ADR-0019-payments-multi-provider.md) in all three locales.

## Current provider status (evidenced in code)

| Provider | `providerCode` | `implemented` | Source |
|---|---|---|---|
| Mercado Pago | `mercadopago` | `true` | `MercadoPagoPaymentAdapter` → existing MP services / `mercadoPagoApiClient` |
| Payway | `payway` | `false` (stub) | `apps/server/payments/stubs/PaywayPaymentAdapter.ts` |
| Stripe | `stripe` | `false` (stub) | `apps/server/payments/stubs/StripePaymentAdapter.ts` |
