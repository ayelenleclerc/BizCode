# SaaS self-service onboarding (#180)

## Purpose

Documents public tenant registration, 30-day trial, trial banner, and invoice mutation gate when the trial expires.

**Evidence status:** Implemented in product code (local Docker Postgres `:5432` migration verified). Live AFIP Padrón SOAP and paid subscription billing (#182) are residual. Not a certification claim.

## Flow

1. Guest visits `/` (landing) → `/registro`.
2. `POST /api/saas/register` creates tenant (`saasStatus=trial`, `trialEndsAt=now+30d`), owner (username = email), starter `TenantConfig` / `TenantPlan`, and `ParamEmpresa` (CUIT + name).
3. Optional welcome email when SMTP is configured; otherwise registration still succeeds (`emailSent=false`).
4. Authenticated shell shows trial banner via `GET /api/saas/trial`.
5. Expired trial → `saasStatus=suspended_trial`; `POST /api/facturas` returns `403` with `code=TRIAL_SUSPENDED` (read-only).

## Padrón

CUIT checksum is always validated. Lookup uses the existing Padrón A4 **mock** (#192) when live SOAP is unavailable. Timeout CUIT returns `503`.

## Jobs

```bash
npm run saas:trial-reminders
```

Suspends overdue trials and sends reminders at 7 / 3 / 1 days before end when SMTP is configured.

## Residual

- SaaS subscription billing / auto-charge (#182)
- Live Padrón A4 SOAP in production
- Email delivery without SMTP

## Related

- API: `/api/saas/register`, `/api/saas/trial`, `/api/saas/slug-suggestion`
- Privacy public page: `/privacidad`
- Product vision: [product-vision-and-deployment.md](product-vision-and-deployment.md)
