# Log monitoring and alerting procedure

| Document code | SEC-011 |
| Version | 0.2 |
| Date | 2026-07-30 |
| Author | BizCode |
| Requirement level | Highly recommended |
| Normative applicability | ISO/IEC 27001:2022 |
| Evidence status | Partial (product monitoring #221) |

## Out-of-scope statement

Organizational SIEM tooling, 24×7 SOC staffing, and certification claims are out of scope. Do not claim ISO certification from this document alone.

## Purpose

Define how BizCode records, classifies, and alerts on security-relevant log events for platform operators.

## Product evidence (#221)

- Classification fields on `AuditEvent` (`securityEventType`, `severity`).
- Async monitor every 60s: brute-force login, 403 bursts, classified critical/high events.
- Alerts to `super_admin` via in-app notifications and optional email/WhatsApp (`SECURITY_ALERT_*`).
- Operator timeline: `GET /api/superadmin/security-events` and UI `/superadmin/security`.
- Narrative: [Security monitoring (#221)](../../quality/security-monitoring.md).
- Related response tools: [Incident response (#222)](../../quality/incident-response.md).

## Operator steps (summary)

1. Review the super-admin security timeline (last 24h).
2. For critical alerts, follow [incident response](../../quality/incident-response.md) (revoke sessions, disable tenant, maintenance).
3. Confirm SMTP/Twilio/`SECURITY_ALERT_*` configuration in each environment if external channels are required.

## Revision history

| Version | Date | Author | Summary of changes |
|--------------|-----------|-------------|----------------|
| 0.1 | 2026-04-01 | BizCode | Initial stub |
| 0.2 | 2026-07-30 | BizCode | Link product evidence for security monitoring (#221) |
