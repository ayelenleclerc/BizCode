# Security monitoring and alerts (#221)

## Purpose

Describes how BizCode classifies security-relevant audit events, evaluates detection rules asynchronously, and surfaces alerts to platform `super_admin` operators. Complements [incident response (#222)](incident-response.md) (response tools) and ISO [SEC-011](../certificacion-iso/sec/sec-011-log-monitoring-alerting-procedure.md).

**Evidence status:** Implemented in product (taxonomy on `AuditEvent`, 60s monitor poller, in-app + channel alerts, super-admin timeline). ISO-ready narrative; not a certification claim.

## Taxonomy

`AuditEvent.securityEventType` and `severity` (`critical` | `high` | `info`) are set by `writeAuditEvent` via [`securityTaxonomy.ts`](../../../apps/server/security/securityTaxonomy.ts).

| Type | Typical severity | Source |
|------|------------------|--------|
| `brute_force_login` | critical | `LoginAttempt` failures (≥5) via monitor |
| `login_geo_anomaly` | critical | Login / MFA verify with country ≠ baseline |
| `role_escalation` | critical | `user_update` to privileged role |
| `mfa_disabled_critical` | critical | MFA disable on privileged role |
| `forbidden_burst` | critical | ≥10 HTTP 403 from same IP in 60s |
| `user_privileged_create` | high | `user_create` with owner/manager/super_admin |
| `tenant_incident_action` | info | Incident tools (#222) |
| `info_login_success` | info | Successful login / MFA verify |

## Async processing

- [`securityMonitor.ts`](../../../apps/server/security/securityMonitor.ts) runs every 60 seconds when the API server starts (`startSecurityMonitor` in [`server.ts`](../../../apps/server/server.ts)).
- Disabled when `NODE_ENV=test` unless `BIZCODE_SECURITY_MONITOR=true`; can force off with `BIZCODE_SECURITY_MONITOR=false`.
- Watermark: `SecurityMonitorCursor`; alert dedupe: `SecurityAlertDedupe` (15-minute window).
- HTTP path is not blocked by rule evaluation (finish-listener for 403 counts only).

## Alert channels (BizCode-owned pipeline)

1. **In-app:** `createNotification` to all active `super_admin` users (`security_alert_critical` / `security_alert_high`).
2. **Email / WhatsApp:** [`dispatchSecurityAlertChannels`](../../../apps/server/channels.ts) using `SECURITY_ALERT_EMAILS` / `SECURITY_ALERT_PHONES` (soft-fail if unset).
3. **Slack (optional):** `SECURITY_ALERT_SLACK_WEBHOOK` — not required for DoD.

## Operator UI / API

- Timeline: SuperAdmin → *Security events (last 24h)* (`/superadmin/security`).
- API: `GET /api/superadmin/security-events?hours=24&severity=` (requires `super_admin` + `platform.tenants.manage`).

## Out of scope (this delivery)

- Bull/BullMQ queue; Datadog / AWS GuardDuty.
- New Mercado Pago / ARCA integrations.
- Mobile app hardening (#220).
- AFIP/MP credential-change rules without existing audit actions.

## Related

- [Incident response](incident-response.md)
- [Security](../security.md)
- [IAM / sessions / audit](iam-model-sessions-audit.md)
