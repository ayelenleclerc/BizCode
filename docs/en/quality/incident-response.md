# Security incident response (#222)

## Purpose

Operational runbook for security incidents affecting BizCode (desktop, SaaS API, or tenant data). Complements ISO stub [SEC-008](../certificacion-iso/sec/sec-008-incident-management-procedure.md) with actions evidenced in the product.

**Evidence status:** Product tools for session revoke, tenant disable, and maintenance mode are implemented in the super-admin panel and API (`POST /api/superadmin/tenants/{tenantId}/revoke-all-sessions`, `POST .../disable`, `POST .../maintenance`, forensic audit listing). This document is **ISO-ready**, not a claim of certification.

## 1. Incident classification

| Severity | Examples | Initial response time |
|----------|----------|----------------------|
| **Critical** | Customer data breach; unauthorized `super_admin` access; mass exfiltration | Immediate (minutes) |
| **High** | Credential exposure; database reachable from public network; widespread token theft | Within 1 hour |
| **Medium** | Single-user session compromise; MFA disabled on a privileged account without approval | Same business day |
| **Low** | Failed intrusion attempts; blocked brute force with no successful login | Log and trend review |

## 2. Runbooks

### 2.1 Credential / session compromise

1. Identify affected user(s) or tenant via the tenant audit log UI and/or forensic export API.
2. **Revoke sessions:** SuperAdmin → tenant detail → *Revoke all sessions*, or `POST /api/superadmin/tenants/{tenantId}/revoke-all-sessions`.
3. Force password reset for compromised accounts; re-enable MFA if disabled.
4. Rotate exposed secrets (Doppler / env) per [secrets management](secrets-management-and-doppler.md).
5. Notify the tenant owner; record actions in the audit trail (`incident_revoke_sessions`, etc.).

### 2.2 Tenant compromise or active abuse

1. **Maintenance mode** (blocks tenant user login and API; platform `super_admin` remains able to manage): `POST /api/superadmin/tenants/{tenantId}/maintenance` with `{ "enabled": true }` (also revokes tenant sessions).
2. If longer isolation is required: **Disable tenant** via UI or `POST /api/superadmin/tenants/{tenantId}/disable` (`active=false` + session revoke). Reactivate with existing `PATCH ... { "active": true }` when cleared.
3. Export forensic audit: `GET /api/superadmin/tenants/{tenantId}/audit-events?startDate=&endDate=`.
4. Preserve logs; do not delete audit rows.

### 2.3 Exposed database or infrastructure

1. Close network exposure (firewall / security groups / Cloudflare).
2. Rotate `DATABASE_URL` and related credentials.
3. Assess data accessed; follow legal notification if personal data may have been disclosed (§4).
4. Post-mortem (§5).

## 3. Super-admin response tools (product)

| Action | UI | API |
|--------|----|-----|
| Revoke all tenant sessions | Tenant detail | `POST /api/superadmin/tenants/{tenantId}/revoke-all-sessions` |
| Disable tenant | Tenant detail / Suspend | `POST /api/superadmin/tenants/{tenantId}/disable` |
| Maintenance mode | Tenant detail | `POST /api/superadmin/tenants/{tenantId}/maintenance` |
| Forensic audit list | Tenant detail export | `GET /api/superadmin/tenants/{tenantId}/audit-events` |

**Maintenance vs disable:** Maintenance keeps the tenant record active for operators but blocks end-user auth/API for that tenant. Disable (`active=false`) rejects login as invalid credentials and isolates the tenant until reactivation.

**Out of scope for maintenance:** Background job workers for the tenant are not automatically paused; stop or disable jobs manually if the incident requires it.

## 4. Legal notifications (Argentina)

Under **Ley 25.326** and AAIP guidance, evaluate whether a personal-data breach requires notification to the **Agencia de Acceso a la Información Pública (AAIP)** and to affected data subjects. Target assessment within **72 hours** of confirmed breach awareness. Use counsel; do not invent statutory text in product UI.

Suggested notification content: nature of the breach, categories of data, approximate volume, measures taken, contact for questions.

Reference: [AAIP](https://www.argentina.gob.ar/aaip).

## 5. Post-mortem template

| Field | Content |
|-------|---------|
| Title / ID | |
| Severity | Critical / High / Medium / Low |
| Timeline | Detection → containment → eradication → recovery |
| Root cause | |
| Impact | Tenants, users, data categories |
| What went well | |
| What to improve | |
| Corrective actions | Owner, due date |
| Links | Audit export, PRs, tickets |

## References

- Issue #222
- [SEC-008 Incident management procedure](../certificacion-iso/sec/sec-008-incident-management-procedure.md)
- [Security overview](../security.md)
- OpenAPI: `docs/api/openapi.yaml` (superadmin tenant incident paths)
