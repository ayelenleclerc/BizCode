# Como adicionar um adapter de pagamentos (#377, ADR-0019)

Guia para adicionar um novo adapter de PSP ao módulo multi-provedor de [ADR-0019](../adr/ADR-0019-payments-multi-provider.md). Reflete o código implementado; não descreve comportamento hipotético.

## 1. Código do provedor

Adicionar o código em `PAYMENT_PROVIDER_CODES` em [`apps/server/payments/types.ts`](../../../apps/server/payments/types.ts).

## 2. Implementar `PaymentProviderAdapter`

Criar `apps/server/payments/<provider>/<Provider>PaymentAdapter.ts`. Usar `MercadoPagoPaymentAdapter` como referência: **envolve** serviços existentes, sem segundo cliente HTTP.

## 3. Substituir o stub

Enquanto o cliente não for real, manter o stub em `apps/server/payments/stubs/` com `PaymentAdapterNotImplementedError`.

## 4. Registrar factory

Em `bootstrapPaymentProviders.ts` e no `switch` fechado de `getPaymentProviderAdapter`.

## 5. Prisma / segredos

Reutilizar `PaymentProviderConfig` com `encryptFiscalSecret`. Os checkouts são persistidos em `PaymentTransaction` (`idempotencyKey = '{provider}:factura:{invoiceId}'`) via `PaymentService` / `PaymentTransactionService`; o adapter não deve inventar outra tabela ledger.

## 6. Rotas / UI / OpenAPI

As rotas genéricas (checkout/status/refund/flags) e `PaymentProviderSection` já são agnósticas. Atualizar o enum OpenAPI `PaymentProviderCode` se houver código novo.

## 7. Testes

Espelho de `tests/server/payments/mercadopago/mercadoPagoPaymentAdapter.test.ts`. Não reduzir limiares de cobertura.

## 8. Documentação

Atualizar este guia e o ADR-0019 nos três idiomas.

## Status atual (evidenciado)

| Provedor | código | implemented | Fonte |
|---|---|---|---|
| Mercado Pago | `mercadopago` | `true` | Adapter → serviços MP existentes |
| Payway | `payway` | `false` | stub |
| Stripe | `stripe` | `false` | stub |
