# Onboarding SaaS self-service (#180)

## Propósito

Documenta el registro público de tenant, trial de 30 días, banner de trial y el gate de emisión de facturas al vencer.

**Estado de evidencia:** Implementado en código (migración verificada en Docker Postgres `:5432`). SOAP live de Padrón AFIP y cobro de suscripción (#182) son residuales. No es afirmación de certificación.

## Flujo

1. Visitante en `/` (landing) → `/registro`.
2. `POST /api/saas/register` crea tenant (`saasStatus=trial`, `trialEndsAt=now+30d`), owner (username = email), plan starter y `ParamEmpresa`.
3. Email de bienvenida si hay SMTP; si no, el registro igual OK (`emailSent=false`).
4. Banner autenticado vía `GET /api/saas/trial`.
5. Trial vencido → `suspended_trial`; `POST /api/facturas` → `403` (`TRIAL_SUSPENDED`).

## Padrón

Checksum CUIT obligatorio. Consulta con mock Padrón A4 (#192) si no hay SOAP live.

## Jobs

```bash
npm run saas:trial-reminders
```

## Residual

- Billing SaaS: ver [billing-saas-plataforma.md](billing-saas-plataforma.md) (#182)
- Padrón SOAP live
- Emails sin SMTP

## Relacionado

- [vision-producto-y-despliegue.md](vision-producto-y-despliegue.md) · [privacidad-y-derechos-del-titular.md](privacidad-y-derechos-del-titular.md)
