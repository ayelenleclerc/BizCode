# Privacy and data subject rights (#195)

## Purpose

Describes how BizCode supports Ley 25.326 / GDPR-aligned data-subject rights for **customer** personal data stored in `Cliente`. Complements the [privacy data map](../privacy-data-map.md) and ISO [PRV-001](../certificacion-iso/prv/prv-001-privacy-policy.md).

**Evidence status:** Implemented in product (export, anonymize, public `/privacidad`, UI consent gate on create). AAIP database registration remains an **operator** administrative task. Not a certification claim.

## Product evidence

| Capability | Evidence |
|------------|----------|
| Access / export | `GET /api/clientes/:id/exportar-datos` (`?format=json\|csv`) — `owner` or `super_admin` + `customers.manage` + ownership |
| Rectification | Existing `PUT /api/clientes/:id` |
| Erasure (anonymization) | `POST /api/clientes/:id/anonimizar` with `{ "confirm": "ANONYMIZE" }`; sets `Cliente.anonymizedAt`; revokes portal sessions; keeps fiscal rows |
| Public policy page | `/privacidad` (unauthenticated) |
| Consent on customer create | UI checkbox gate (not persisted); SaaS tenant onboarding consent on `/registro` (#180) |
| Service | [`ClientePrivacyService.ts`](../../../apps/server/services/ClientePrivacyService.ts) |

## Retention (documented policy)

| Category | Policy |
|----------|--------|
| Fiscal documents / tax ID on invoices | **10 years** (legal retention; anonymize master PII, do not delete invoices) |
| Optional commercial contact (email/phone on master) | Until erasure request / anonymization (**~5 years** commercial guidance when no longer needed) |
| Driver GPS samples | **7 days** (existing purge job) |

No automated fiscal purge job is shipped in this delivery.

## AAIP registration (operator)

1. Identify databases that hold personal data (BizCode PostgreSQL + backups).
2. Follow [AAIP guidance](https://www.argentina.gob.ar/aaip/datospersonales) for registration.
3. Record the registration number in the operator’s controlled records — **never invent a number in this repository**.

## Out of scope

- Self-service tenant onboarding consent (#180) — delivered; see [saas-self-service-onboarding.md](saas-self-service-onboarding.md)
- Marketing preference center (no marketing engine in product)
- Staging/production environment provision (#152)
- `/api/admin/...` prefix (canonical routes remain `/api/clientes/...`)

## Related

- [Privacy data map](../privacy-data-map.md)
- [PRV-001 Privacy policy](../certificacion-iso/prv/prv-001-privacy-policy.md)
- [Security](../security.md)
