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
| Campos `Factura.mp*` | Reutilizar | DTO / resultados do adapter |
| `MercadoPagoProcessedPayment` | Reutilizar | Idempotência de webhooks |

Ver [ADR-0019](../adr/ADR-0019-payments-multi-provider.md).
