# Billing SaaS da plataforma (#182)

## Propósito

Documenta como o BizCode cobra **tenants** pelo produto SaaS (plataforma → tenant), com Mercado Pago Assinaturas (`preapproval`) e **mock** sem credenciais de plataforma.

**Estado de evidência:** Implementado no código. MP live exige `BIZCODE_SAAS_MP_ACCESS_TOKEN`. NF-e/AFIP por cobrança SaaS e Stripe live são residuais. Não é afirmação de certificação.

Este caminho **não** é o Mercado Pago do tenant (ADR-0019 / #377).

## Fluxo

1. Owner/manager autenticado abre `/configuracion/billing`.
2. `GET /api/tenant/billing` lista `SaasInvoice` e `SaasSubscription`.
3. `POST /api/tenant/billing/subscribe` usa preços de `PLAN_CATALOG` (mock se não houver token).
4. `POST /api/saas/billing/webhook`: mock sem assinatura; live exige `x-bizcode-saas-webhook-secret`.
5. Falhas incrementam tentativas; na 3ª → `suspended_payment`. Job `npm run saas:billing-retries` também suspende após 7 dias.
6. `suspended_payment` bloqueia `POST /api/facturas` (`PAYMENT_SUSPENDED`) e o shell só permite renovar.

## Residual

- AFIP por cobrança SaaS
- Stripe live
- E-mails sem SMTP
- Preapproval live sem credenciais da plataforma

## Relacionado

- [onboarding-saas-self-service.md](onboarding-saas-self-service.md) (#180)
- [ADR-0021](../adr/ADR-0021-saas-platform-billing.md)
- [visao-produto-e-implantacao.md](visao-produto-e-implantacao.md)
