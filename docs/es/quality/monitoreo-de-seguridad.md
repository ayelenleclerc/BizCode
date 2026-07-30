# Monitoreo de seguridad y alertas (#221)

## Propósito

Describe cómo BizCode clasifica eventos de auditoría relevantes para seguridad, evalúa reglas de detección de forma asíncrona y muestra alertas a operadores `super_admin` de plataforma. Complementa [respuesta a incidentes (#222)](respuesta-a-incidentes.md) y el stub ISO [SEC-011](../certificacion-iso/sec/sec-011-logs-alertas.md).

**Estado de evidencia:** Implementado en producto (taxonomía en `AuditEvent`, poller 60s, alertas in-app + canales, timeline super-admin). Narrativa lista para ISO; no es una afirmación de certificación.

## Taxonomía

`AuditEvent.securityEventType` y `severity` (`critical` | `high` | `info`) se asignan en `writeAuditEvent` vía [`securityTaxonomy.ts`](../../../apps/server/security/securityTaxonomy.ts).

| Tipo | Severidad típica | Fuente |
|------|------------------|--------|
| `brute_force_login` | critical | Fallos `LoginAttempt` (≥5) vía monitor |
| `login_geo_anomaly` | critical | Login / MFA verify con país ≠ baseline |
| `role_escalation` | critical | `user_update` a rol privilegiado |
| `mfa_disabled_critical` | critical | Desactivación MFA en rol privilegiado |
| `forbidden_burst` | critical | ≥10 HTTP 403 de la misma IP en 60s |
| `user_privileged_create` | high | `user_create` owner/manager/super_admin |
| `tenant_incident_action` | info | Herramientas de incidente (#222) |
| `info_login_success` | info | Login / MFA verify exitoso |

## Procesamiento asíncrono

- [`securityMonitor.ts`](../../../apps/server/security/securityMonitor.ts) cada 60 segundos al arrancar el API (`startSecurityMonitor` en [`server.ts`](../../../apps/server/server.ts)).
- Desactivado en `NODE_ENV=test` salvo `BIZCODE_SECURITY_MONITOR=true`; forzar off con `BIZCODE_SECURITY_MONITOR=false`.
- Watermark: `SecurityMonitorCursor`; dedupe: `SecurityAlertDedupe` (ventana 15 minutos).
- El path HTTP no se bloquea por la evaluación de reglas.

## Canales de alerta (pipeline propio BizCode)

1. **In-app:** `createNotification` a todos los `super_admin` activos.
2. **Email / WhatsApp:** `SECURITY_ALERT_EMAILS` / `SECURITY_ALERT_PHONES` (soft-fail si no hay config).
3. **Slack (opcional):** `SECURITY_ALERT_SLACK_WEBHOOK`.

## UI / API de operador

- Timeline: SuperAdmin → *Eventos de seguridad* (`/superadmin/security`).
- API: `GET /api/superadmin/security-events`.

## Fuera de alcance

- Bull/BullMQ; Datadog / GuardDuty.
- Nuevas integraciones Mercado Pago / ARCA.
- Hardening mobile (#220).

## Relacionado

- [Respuesta a incidentes](respuesta-a-incidentes.md)
- [Seguridad](../seguridad.md)
