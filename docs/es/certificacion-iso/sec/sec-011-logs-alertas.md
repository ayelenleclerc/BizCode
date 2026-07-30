# Procedimiento de monitorización de logs y alertas

| Código de documento | SEC-011 |
| Versión | 0.2 |
| Fecha | 2026-07-30 |
| Autor | BizCode |
| Nivel de requisito | Muy recomendado |
| Aplicabilidad normativa | ISO/IEC 27001:2022 |
| Estado de evidencia | Parcial (monitoreo de producto #221) |

## Declaración de fuera de alcance

Herramientas SIEM organizacionales, SOC 24×7 y afirmaciones de certificación quedan fuera de alcance. No afirmar certificación ISO solo con este documento.

## Propósito

Definir cómo BizCode registra, clasifica y alerta eventos de log relevantes para seguridad a operadores de plataforma.

## Evidencia de producto (#221)

- Campos de clasificación en `AuditEvent` (`securityEventType`, `severity`).
- Monitor asíncrono cada 60s: fuerza bruta, ráfagas 403, eventos critical/high clasificados.
- Alertas a `super_admin` in-app y email/WhatsApp opcionales (`SECURITY_ALERT_*`).
- Timeline: `GET /api/superadmin/security-events` y UI `/superadmin/security`.
- Narrativa: [Monitoreo de seguridad (#221)](../../quality/monitoreo-de-seguridad.md).
- Respuesta: [Respuesta a incidentes (#222)](../../quality/respuesta-a-incidentes.md).

## Historial de revisiones

| Versión | Fecha | Autor | Resumen de cambios |
|--------------|-----------|-------------|----------------|
| 0.1 | 2026-04-01 | BizCode | Stub inicial |
| 0.2 | 2026-07-30 | BizCode | Evidencia de producto de monitoreo (#221) |
