# ADR-0019: Módulo de cobranças multi-provedor (Mercado Pago como primeiro adapter)

**Status:** Aceito  
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
6. `PaymentProviderConfigService`, `PaymentService`, `PaymentWebhookService` (fachada; efeitos ReciboCobro em `MercadoPagoWebhookService`).
7. Rotas genéricas `/api/payments/*` + alias legado MP.
8. UI `PaymentProviderSection` + formulário `MercadoPagoConfigSection`.

## Consequências

- Positivo: MP intercambiável; stubs degradam com 501.
- Negativo: duas fontes de config até deprecar `MercadoPagoConfig`.
- **Não evidenciado no código atual:** clientes live Payway/Fiserv/Getnet/Stripe.
- Seguimento: ADR futuro antes de remover dual-read ou implementar adapter não-MP real.

## Referências

- Issue #377
- [ADR-0007](ADR-0007-dual-deployment-and-fiscal-modularity.md)
- [ADR-0018](ADR-0018-fiscal-multi-organism-e-invoicing.md)
- [Inventário cobranças multi-provedor (#377)](../quality/inventario-cobrancas-multi-provedor-377.md)
- [Como adicionar um adapter de pagamentos](../guides/como-adicionar-um-adapter-de-pagamentos.md)
