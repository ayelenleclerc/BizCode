# Billing SaaS de plataforma (#182)

## Propósito

Documenta cómo BizCode cobra a **tenants** por el producto SaaS (plataforma → tenant), con Mercado Pago Suscripciones (`preapproval`) y **mock** si no hay credenciales de plataforma.

**Estado de evidencia:** Implementado en código. MP live requiere `BIZCODE_SAAS_MP_ACCESS_TOKEN`. Factura AFIP por cobro SaaS y Stripe live son residuales. No es afirmación de certificación.

Este camino **no** es el Mercado Pago del tenant (ADR-0019 / #377), que cobra a los clientes del negocio.

## Flujo

1. Owner/manager autenticado abre `/configuracion/billing`.
2. `GET /api/tenant/billing` lista `SaasInvoice` y `SaasSubscription`.
3. `POST /api/tenant/billing/subscribe` usa precios de `PLAN_CATALOG`:
   - sin token de plataforma, o precio `0` → mock + `saasStatus=active`
   - token live + plan pago → `initPoint` de preapproval
4. `POST /api/saas/billing/webhook`: mock sin firma; live exige `x-bizcode-saas-webhook-secret`.
5. Fallos de cobro incrementan reintentos; a 3 → `suspended_payment`. Job `npm run saas:billing-retries` también suspende a los 7 días.
6. `suspended_payment` bloquea `POST /api/facturas` (`PAYMENT_SUSPENDED`) y el shell solo deja renovar.

## Residual

- AFIP por cobro SaaS
- Stripe live
- Emails sin SMTP
- Preapproval live sin credenciales de plataforma

## Relacionado

- [onboarding-saas-self-service.md](onboarding-saas-self-service.md) (#180)
- [ADR-0021](../adr/ADR-0021-saas-platform-billing.md)
- [vision-producto-y-despliegue.md](vision-producto-y-despliegue.md)
