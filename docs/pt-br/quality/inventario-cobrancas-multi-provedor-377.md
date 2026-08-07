# Inventário cobranças multi-provedor (#377)

Mapeia componentes Mercado Pago existentes para o módulo multi-provedor.

| Componente | Ação | Destino |
|-----------|------|---------|
| `MercadoPagoConfig` (Prisma) | Dual-read/write na transição | `PaymentProviderConfig` (`providerCode=mercadopago`) |
| `MercadoPagoConfigService` | Manter; envolvido para dual-write | `PaymentProviderConfigService` + adapter |
| `mercadoPagoApiClient.ts` | Reutilizar (único cliente HTTP) | Somente dentro do adapter/serviços MP |
| `MercadoPagoPreferenceService` | Envolver | `MercadoPagoPaymentAdapter.createPayment` / `PaymentService` |
| `MercadoPagoQrService` | Manter sob capacidades MP | Rotas legadas / capacidades |
| `MercadoPagoWebhookService` | Delegar | `PaymentWebhookService` + adapter `parseWebhook` |
| `MercadoPagoRefundService` | Envolver | Adapter `refundPayment` |
| `MercadoPagoReconciliationService` | Manter específico MP | Rotas legadas |
| `MercadoPagoChargebackService` | Manter específico MP | Rotas legadas |
| `/api/configuracion/mercadopago*` | Alias compat | `PaymentProviderConfigService` |
| `/api/facturas/:id/mp/*` | Alias compat | `PaymentService` |
| `/api/webhooks/mercadopago` | Alias compat | `PaymentWebhookService` |
| `MercadoPagoConfigSection` | Montar dentro da seção genérica | `PaymentProviderSection` |
| Flag de integração `mercadopago` | Manter | `IfIntegration` / `requireMercadoPagoIntegration` |
| Campos `Factura.mp*` | Dual-write com ledger (até ADR de corte) | Preferência/QR MP; espelho de `PaymentTransaction` |
| `PaymentTransaction` (Prisma) | Ledger novo (DoD #377) | `PaymentTransactionService` + `PaymentService` / webhook / refund |
| `MercadoPagoProcessedPayment` | Reutilizar | Idempotência de webhooks (+ sync do ledger) |

## Entregue (#377)

- Contrato + registry; adapter MP live; stubs Payway/Stripe.
- `PaymentProviderConfig` + migrate/verify; ledger `PaymentTransaction` com create idempotente.
- Serviços genéricos + rotas `/api/payments/*` (checkout/status/refund/flags) e alias MP `deprecated`.
- UI default/enable + checkout via `paymentsAPI.createCheckout`.

Ver [ADR-0019](../adr/ADR-0019-payments-multi-provider.md).
