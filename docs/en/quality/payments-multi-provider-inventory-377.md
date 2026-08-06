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
| Factura `mp*` fields | Reuse (no dual Factura table) | Normalized via DTO / adapter results |
| `MercadoPagoProcessedPayment` | Reuse | Idempotency store for webhooks |

## Delivered (#377)

- Contract + registry: `PaymentProviderAdapter`, `paymentProviderRegistry`, `bootstrapPaymentProviders`.
- Live adapter: `MercadoPagoPaymentAdapter` (wraps existing MP services; single HTTP client).
- Stubs: Payway / Stripe (`implemented: false`).
- Prisma `PaymentProviderConfig` + dual-read/write + migrate/verify scripts.
- Services: `PaymentProviderConfigService`, `PaymentService`, `PaymentWebhookService`.
- Routes: `/api/payments/*` + legacy MP aliases.
- UI: `PaymentProviderSection` + `MercadoPagoConfigSection`.

## Consumers confirmed

- Facturación: preference / QR / refund modals
- Webhook + reconciliation + chargebacks
- Portal: opens existing `mpPaymentLink` only
- OpenAPI tag `mercadopago` (+ new `payments`)
