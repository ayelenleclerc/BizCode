# Cómo agregar un adapter de pagos (#377, ADR-0019)

Guía para añadir un nuevo adapter de PSP al módulo multi-proveedor de [ADR-0019](../adr/ADR-0019-payments-multi-provider.md). Refleja el código implementado; no describe comportamiento hipotético.

## 1. Código de proveedor

Añadir el código a `PAYMENT_PROVIDER_CODES` en [`apps/server/payments/types.ts`](../../../apps/server/payments/types.ts).

## 2. Implementar `PaymentProviderAdapter`

Crear `apps/server/payments/<provider>/<Provider>PaymentAdapter.ts` implementando el contrato. Usar `MercadoPagoPaymentAdapter` como referencia: **envuelve** servicios existentes, no crea un segundo cliente HTTP.

## 3. Reemplazar el stub

Hasta que el cliente sea real, mantener el stub en `apps/server/payments/stubs/` con `PaymentAdapterNotImplementedError`.

## 4. Registrar factory

En `bootstrapPaymentProviders.ts` y el `switch` cerrado de `getPaymentProviderAdapter`.

## 5. Prisma / secretos

Reutilizar `PaymentProviderConfig` con `encryptFiscalSecret`. Los checkouts se persisten en `PaymentTransaction` (`idempotencyKey = '{provider}:factura:{invoiceId}'`) vía `PaymentService` / `PaymentTransactionService`; el adapter no debe inventar otra tabla ledger.

## 6. Rutas / UI / OpenAPI

Las rutas genéricas (checkout/status/refund/flags) y `PaymentProviderSection` ya son agnósticas. Actualizar el enum OpenAPI `PaymentProviderCode` si se agrega un código nuevo.

## 7. Tests

Espejo de `tests/server/payments/mercadopago/mercadoPagoPaymentAdapter.test.ts`. No bajar umbrales de cobertura.

## 8. Documentación

Actualizar esta guía y ADR-0019 en los tres idiomas.

## Estado actual (evidenciado)

| Proveedor | código | implemented | Fuente |
|---|---|---|---|
| Mercado Pago | `mercadopago` | `true` | Adapter → servicios MP existentes |
| Payway | `payway` | `false` | stub |
| Stripe | `stripe` | `false` | stub |
