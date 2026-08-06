# Inventario cobros multi-proveedor (#377)

Mapea componentes Mercado Pago existentes hacia el módulo multi-proveedor.

| Componente | Acción | Destino |
|-----------|--------|---------|
| `MercadoPagoConfig` (Prisma) | Dual-read/write en la transición | `PaymentProviderConfig` (`providerCode=mercadopago`) |
| `MercadoPagoConfigService` | Conservar; envuelto para dual-write | `PaymentProviderConfigService` + adapter |
| `mercadoPagoApiClient.ts` | Reutilizar (único cliente HTTP) | Solo dentro del adapter/servicios MP |
| `MercadoPagoPreferenceService` | Envolver | `MercadoPagoPaymentAdapter.createPayment` / `PaymentService` |
| `MercadoPagoQrService` | Conservar bajo capacidades MP | Rutas legacy / capacidades |
| `MercadoPagoWebhookService` | Delegar | `PaymentWebhookService` + adapter `parseWebhook` |
| `MercadoPagoRefundService` | Envolver | Adapter `refundPayment` |
| `MercadoPagoReconciliationService` | Conservar específico MP | Rutas legacy |
| `MercadoPagoChargebackService` | Conservar específico MP | Rutas legacy |
| `/api/configuracion/mercadopago*` | Alias compat | `PaymentProviderConfigService` |
| `/api/facturas/:id/mp/*` | Alias compat | `PaymentService` |
| `/api/webhooks/mercadopago` | Alias compat | `PaymentWebhookService` |
| `MercadoPagoConfigSection` | Montar dentro de sección genérica | `PaymentProviderSection` |
| Flag de integración `mercadopago` | Conservar | `IfIntegration` / `requireMercadoPagoIntegration` |
| Campos `Factura.mp*` | Reutilizar | DTO / resultados del adapter |
| `MercadoPagoProcessedPayment` | Reutilizar | Idempotencia de webhooks |

Ver [ADR-0019](../adr/ADR-0019-payments-multi-provider.md).
