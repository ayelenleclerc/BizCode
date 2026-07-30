# Monitoramento de segurança e alertas (#221)

## Propósito

Descreve como o BizCode classifica eventos de auditoria relevantes para segurança, avalia regras de detecção de forma assíncrona e apresenta alertas a operadores `super_admin` da plataforma. Complementa [resposta a incidentes (#222)](resposta-a-incidentes.md) e o stub ISO [SEC-011](../certificacion-iso/sec/sec-011-logs-alertas.md).

**Status de evidência:** Implementado no produto (taxonomia em `AuditEvent`, poller 60s, alertas in-app + canais, timeline super-admin). Narrativa pronta para ISO; não é uma afirmação de certificação.

## Taxonomia

`AuditEvent.securityEventType` e `severity` (`critical` | `high` | `info`) são definidos em `writeAuditEvent` via [`securityTaxonomy.ts`](../../../apps/server/security/securityTaxonomy.ts).

| Tipo | Severidade típica | Fonte |
|------|-------------------|--------|
| `brute_force_login` | critical | Falhas `LoginAttempt` (≥5) via monitor |
| `login_geo_anomaly` | critical | Login / MFA verify com país ≠ baseline |
| `role_escalation` | critical | `user_update` para papel privilegiado |
| `mfa_disabled_critical` | critical | Desativação MFA em papel privilegiado |
| `forbidden_burst` | critical | ≥10 HTTP 403 do mesmo IP em 60s |
| `user_privileged_create` | high | `user_create` owner/manager/super_admin |
| `tenant_incident_action` | info | Ferramentas de incidente (#222) |
| `info_login_success` | info | Login / MFA verify bem-sucedido |

## Processamento assíncrono

- [`securityMonitor.ts`](../../../apps/server/security/securityMonitor.ts) a cada 60 segundos ao iniciar a API.
- Desativado em `NODE_ENV=test` salvo `BIZCODE_SECURITY_MONITOR=true`.
- Watermark: `SecurityMonitorCursor`; dedupe: `SecurityAlertDedupe` (15 minutos).

## Canais de alerta (pipeline próprio BizCode)

1. **In-app:** `createNotification` para todos os `super_admin` ativos.
2. **Email / WhatsApp:** `SECURITY_ALERT_EMAILS` / `SECURITY_ALERT_PHONES` (soft-fail).
3. **Slack (opcional):** `SECURITY_ALERT_SLACK_WEBHOOK`.

## UI / API do operador

- Timeline: SuperAdmin → *Eventos de segurança* (`/superadmin/security`).
- API: `GET /api/superadmin/security-events`.

## Fora de escopo

- Bull/BullMQ; Datadog / GuardDuty.
- Novas integrações Mercado Pago / ARCA.
- Hardening mobile (#220).

## Relacionado

- [Resposta a incidentes](resposta-a-incidentes.md)
- [Segurança](../seguranca.md)
