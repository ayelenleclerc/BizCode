# Onboarding SaaS self-service (#180)

## Propósito

Documenta o registro público de tenant, trial de 30 dias, banner de trial e o gate de emissão de faturas ao expirar.

**Estado de evidência:** Implementado no código (migração verificada no Docker Postgres `:5432`). SOAP live do Padrón AFIP e cobrança de assinatura (#182) são residuais. Não é afirmação de certificação.

## Fluxo

1. Visitante em `/` (landing) → `/registro`.
2. `POST /api/saas/register` cria tenant (`saasStatus=trial`, `trialEndsAt=now+30d`), owner (username = e-mail), plano starter e `ParamEmpresa`.
3. E-mail de boas-vindas se houver SMTP; caso contrário o registro ainda OK (`emailSent=false`).
4. Banner autenticado via `GET /api/saas/trial`.
5. Trial vencido → `suspended_trial`; `POST /api/facturas` → `403` (`TRIAL_SUSPENDED`).

## Padrón

Checksum CUIT obrigatório. Consulta com mock Padrón A4 (#192) sem SOAP live.

## Jobs

```bash
npm run saas:trial-reminders
```

## Residual

- Billing SaaS (#182)
- Padrón SOAP live
- E-mails sem SMTP

## Relacionado

- [visao-produto-e-implantacao.md](visao-produto-e-implantacao.md) · [privacidade-e-direitos-do-titular.md](privacidade-e-direitos-do-titular.md)
