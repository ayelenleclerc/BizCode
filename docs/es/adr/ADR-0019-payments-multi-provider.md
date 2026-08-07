# ADR-0019: Módulo de cobros multi-proveedor (Mercado Pago como primer adapter)

**Estado:** Aceptado (enmienda 2026-08-07: ledger `PaymentTransaction` + cierre DoD #377)  
**Fecha:** 2026-08-06  
**Referencia ISO:** ISO/IEC 12207:2017 §6.3.2; ISO 9001:2015 §8.3.3

---

## Contexto

BizCode cobra en línea mediante Mercado Pago (`MercadoPago*Service`, `mercadoPagoApiClient.ts`), consumido directamente por preferencias/QR de factura, webhooks, reembolsos, reconciliación y contracargos. La estrategia de producto (issue #377, [ADR-0007](ADR-0007-dual-deployment-and-fiscal-modularity.md), [visión de producto](../quality/vision-producto-y-despliegue.md)) contempla más PSP sin dispersar `if` de proveedor fuera de un módulo dedicado.

Opciones consideradas:

1. Mantener Mercado Pago ad hoc e ir agregando PSP después.
2. Extraer un contrato agnóstico (adapter), con Mercado Pago como único adapter implementado y stubs de capacidades para futuros PSP — espejo de [ADR-0018](ADR-0018-fiscal-multi-organism-e-invoicing.md).

## Decisión

1. Contrato `PaymentProviderAdapter` con códigos `mercadopago`, `payway`, `stripe`.
2. Registry + bootstrap (`paymentProviderRegistry.ts`, `bootstrapPaymentProviders.ts`).
3. `MercadoPagoPaymentAdapter` envuelve los servicios MP existentes — **sin segundo cliente HTTP**.
4. Stubs `payway` / `stripe` con `implemented: false` y `PaymentAdapterNotImplementedError`.
5. Prisma `PaymentProviderConfig` con dual-read/write de `MercadoPagoConfig`; se reutilizan `Factura.mp*` y `MercadoPagoProcessedPayment`.
6. Ledger Prisma `PaymentTransaction` (`@@unique([tenantId, idempotencyKey])`, clave `{provider}:factura:{id}`): upsert en checkout, create idempotente (reutiliza preferencia/link activo), sync en webhook/refund; dual-write con `Factura.mp*` hasta ADR de corte.
7. `PaymentProviderConfigService` (`enabled` / un solo `isDefault`), `PaymentTransactionService`, `PaymentService`, `PaymentWebhookService` (fachada; efectos ReciboCobro en `MercadoPagoWebhookService`).
8. Rutas genéricas `/api/payments/*` (checkout, status, refund, flags) + alias legacy MP (`deprecated: true` en OpenAPI) que delegan create vía `PaymentService`.
9. UI `PaymentProviderSection` (default/enable) + `MercadoPagoConfigSection`; modal de link crea checkout con `paymentsAPI.createCheckout`.

## Consecuencias

- Positivo: MP intercambiable; ledger + idempotencia; stubs degradan con 501.
- Negativo: dual-write (`PaymentTransaction` ↔ `Factura.mp*` ↔ MP legacy) hasta scripts de verify y ADR de corte.
- **No evidenciado en el código actual:** clientes live Payway/Fiserv/Getnet/Stripe.
- Seguimiento: ADR futuro antes de quitar `MercadoPagoConfig` / columnas `Factura.mp*` o implementar un adapter no-MP real.

## Referencias

- Issue #377
- [ADR-0007](ADR-0007-dual-deployment-and-fiscal-modularity.md)
- [ADR-0018](ADR-0018-fiscal-multi-organism-e-invoicing.md)
- [Inventario cobros multi-proveedor (#377)](../quality/inventario-cobros-multi-proveedor-377.md)
- [Cómo agregar un adapter de pagos](../guides/como-agregar-un-adapter-de-pagos.md)
