# Inventory: payments multi-provider (#377)

Maps existing Mercado Pago components to the multi-provider module destinations.

| Component | Action | Destination |
|-----------|--------|-------------|
| `MercadoPagoConfig` (Prisma) | Dual-read/write during transition | `PaymentProviderConfig` (`providerCode=mercadopago`) |
| `MercadoPagoConfigService` | Keep; wrapped for dual-write | `PaymentProviderConfigService` + adapter |
| `mercadoPagoApiClient.ts` | Reuse (single HTTP client) | Used only inside MP adapter/services |
| `MercadoPagoPreferenceService` | Wrap | `MercadoPagoPaymentAdapter.createPayment` / `PaymentService` |
| `MercadoPagoQrService` | Keep under MP adapter capabilities | Adapter QR helpers / legacy routes |
| `MercadoPagoWebhookService` | Delegate | `PaymentWebhookService` + adapter `parseWebhook` |
| `MercadoPagoRefundService` | Wrap | Adapter `refundPayment` |
| `MercadoPagoReconciliationService` | Keep MP-specific; call via registry where needed | Legacy routes + optional PaymentService hooks |
| `MercadoPagoChargebackService` | Keep MP-specific | Legacy routes |
| `/api/configuracion/mercadopago*` | Compat alias | `PaymentProviderConfigService` |
| `/api/facturas/:id/mp/*` | Compat alias | `PaymentService` |
| `/api/webhooks/mercadopago` | Compat alias | `PaymentWebhookService` |
| `MercadoPagoConfigSection` | Mount inside generic section | `PaymentProviderSection` |
| Integration flag `mercadopago` | Keep | Unchanged `IfIntegration` / `requireMercadoPagoIntegration` |
| Factura `mp*` fields | Dual-write with ledger (keep until cut-over ADR) | Written by MP preference/QR path; mirrored from `PaymentTransaction` /
  adapter results |
| `PaymentTransaction` (Prisma) | New ledger (#377 DoD) | `PaymentTransactionService` + `PaymentService` / webhook / refund |
| `MercadoPagoProcessedPayment` | Reuse | Idempotency store for webhooks (+ ledger sync after process) |

## Delivered (#377)

- Contract + registry: `PaymentProviderAdapter`, `paymentProviderRegistry`, `bootstrapPaymentProviders`.
- Live adapter: `MercadoPagoPaymentAdapter` (wraps existing MP services; single HTTP client).
- Stubs: Payway / Stripe (`implemented: false`).
- Prisma `PaymentProviderConfig` + dual-read/write + migrate/verify scripts.
- Prisma `PaymentTransaction` ledger (`idempotencyKey`, dual-write `Factura.mp*`).
- Services: `PaymentProviderConfigService` (default/enabled), `PaymentTransactionService`, `PaymentService`, `PaymentWebhookService`.
- Routes: `/api/payments/*` (checkout, status, refund, flags) + legacy MP aliases (`deprecated` in OpenAPI).
- UI: `PaymentProviderSection` (default/enable) + `MercadoPagoConfigSection`; checkout via `paymentsAPI.createCheckout`.
- Idempotent preference create (reuse active checkout; no empty 409).

## Consumers confirmed

- Facturación: preference / QR / refund modals (`paymentsAPI` for checkout)
- Webhook + reconciliation + chargebacks
- Portal: opens existing `mpPaymentLink` only
- OpenAPI tag `mercadopago` (deprecated paths) + `payments`
