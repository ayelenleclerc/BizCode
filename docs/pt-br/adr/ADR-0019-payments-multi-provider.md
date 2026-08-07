# ADR-0019: Módulo de cobranças multi-provedor (Mercado Pago como primeiro adapter)

**Status:** Aceito (emenda 2026-08-07: ledger `PaymentTransaction` + fechamento DoD #377)  
**Data:** 2026-08-06  
**Referência ISO:** ISO/IEC 12207:2017 §6.3.2; ISO 9001:2015 §8.3.3

---

## Contexto

O BizCode cobra online via Mercado Pago (`MercadoPago*Service`, `mercadoPagoApiClient.ts`), consumido diretamente por preferências/QR de fatura, webhooks, reembolsos, reconciliação e chargebacks. A estratégia de produto (issue #377, [ADR-0007](ADR-0007-dual-deployment-and-fiscal-modularity.md), [visão de produto](../quality/visao-produto-e-implantacao.md)) prevê mais PSPs sem espalhar `if` de provedor fora de um módulo dedicado.

Opções consideradas:

1. Manter Mercado Pago ad hoc e adicionar PSPs depois.
2. Extrair um contrato agnóstico (adapter), com Mercado Pago como único adapter implementado e stubs de capacidades para futuros PSPs — espelho de [ADR-0018](ADR-0018-fiscal-multi-organism-e-invoicing.md).

## Decisão

1. Contrato `PaymentProviderAdapter` com códigos `mercadopago`, `payway`, `stripe`.
2. Registry + bootstrap (`paymentProviderRegistry.ts`, `bootstrapPaymentProviders.ts`).
3. `MercadoPagoPaymentAdapter` envolve os serviços MP existentes — **sem segundo cliente HTTP**.
4. Stubs `payway` / `stripe` com `implemented: false` e `PaymentAdapterNotImplementedError`.
5. Prisma `PaymentProviderConfig` com dual-read/write de `MercadoPagoConfig`; reutiliza `Factura.mp*` e `MercadoPagoProcessedPayment`.
6. Ledger Prisma `PaymentTransaction` (`@@unique([tenantId, idempotencyKey])`, chave `{provider}:factura:{id}`): upsert no checkout, create idempotente (reutiliza preferência/link ativo), sync em webhook/refund; dual-write com `Factura.mp*` até ADR de corte.
7. `PaymentProviderConfigService` (`enabled` / um só `isDefault`), `PaymentTransactionService`, `PaymentService`, `PaymentWebhookService` (fachada; efeitos ReciboCobro em `MercadoPagoWebhookService`).
8. Rotas genéricas `/api/payments/*` (checkout, status, refund, flags) + alias legado MP (`deprecated: true` no OpenAPI) que delegam create via `PaymentService`.
9. UI `PaymentProviderSection` (default/enable) + `MercadoPagoConfigSection`; modal de link cria checkout com `paymentsAPI.createCheckout`.

## Consequências

- Positivo: MP intercambiável; ledger + idempotência; stubs degradam com 501.
- Negativo: dual-write (`PaymentTransaction` ↔ `Factura.mp*` ↔ MP legado) até scripts de verify e ADR de corte.
- **Não evidenciado no código atual:** clientes live Payway/Fiserv/Getnet/Stripe.
- Seguimento: ADR futuro antes de remover `MercadoPagoConfig` / colunas `Factura.mp*` ou implementar adapter não-MP real.

## Referências

- Issue #377
- [ADR-0007](ADR-0007-dual-deployment-and-fiscal-modularity.md)
- [ADR-0018](ADR-0018-fiscal-multi-organism-e-invoicing.md)
- [Inventário cobranças multi-provedor (#377)](../quality/inventario-cobrancas-multi-provedor-377.md)
- [Como adicionar um adapter de pagamentos](../guides/como-adicionar-um-adapter-de-pagamentos.md)
