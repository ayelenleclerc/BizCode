# ADR-0021: Billing SaaS da plataforma vs cobranças do tenant

**Status:** Aceito  
**Date:** 2026-08-24  
**ISO reference:** ISO/IEC 12207:2017 §6.3.2 (software design)

---

## Contexto

O issue [#182](https://github.com/ayelenleclerc/BizCode/issues/182) exige cobrar **tenants** do BizCode. [ADR-0019](ADR-0019-payments-multi-provider.md) cobre Mercado Pago **tenant → cliente**. Misturar credenciais cobraria a parte errada.

Opções:

1. Reutilizar `PaymentProviderAdapter` / `MercadoPagoConfig` do tenant — pagador incorreto.
2. **Preapproval Mercado Pago da plataforma** com env (`BIZCODE_SAAS_MP_*`) e Prisma `SaasSubscription` / `SaasInvoice` — escolhido.
3. Stripe Billing live — fora de escopo.

## Decisão

1. Billing da plataforma em `apps/server/saas/`, não em `apps/server/payments/`.
2. Sem `BIZCODE_SAAS_MP_ACCESS_TOKEN`, o subscribe **mocka** a ativação.
3. Webhook live exige `BIZCODE_SAAS_MP_WEBHOOK_SECRET`.
4. Preços de `PLAN_CATALOG` (#181).
5. AFIP por cobrança SaaS não está neste ADR.

## Consequências

- Separação clara das cobranças a clientes; Docker local funciona sem MP.
- Duas integrações MP (plataforma vs tenant).
- Não evidenciado: Stripe live, AFIP SaaS, HMAC `x-signature` do MP.

## Referências

- Issue #182
- [billing-saas-plataforma.md](../quality/billing-saas-plataforma.md)
- [ADR-0019](ADR-0019-payments-multi-provider.md)
