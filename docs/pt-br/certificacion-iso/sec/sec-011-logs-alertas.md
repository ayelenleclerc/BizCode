# Procedimento de monitoramento de logs e alertas

| Código do documento | SEC-011 |
| Versão | 0.2 |
| Data | 2026-07-30 |
| Autor | BizCode |
| Nível de requisito | Muito recomendado |
| Aplicabilidade normativa | ISO/IEC 27001:2022 |
| Estado de evidência | Parcial (monitoramento de produto #221) |

## Declaração fora do escopo

Ferramentas SIEM organizacionais, SOC 24×7 e afirmações de certificação estão fora de escopo. Não afirmar certificação ISO só com este documento.

## Propósito

Definir como o BizCode registra, classifica e alerta eventos de log relevantes para segurança aos operadores da plataforma.

## Evidência de produto (#221)

- Campos de classificação em `AuditEvent` (`securityEventType`, `severity`).
- Monitor assíncrono a cada 60s: força bruta, rajadas 403, eventos critical/high classificados.
- Alertas a `super_admin` in-app e email/WhatsApp opcionais (`SECURITY_ALERT_*`).
- Timeline: `GET /api/superadmin/security-events` e UI `/superadmin/security`.
- Narrativa: [Monitoramento de segurança (#221)](../../quality/monitoramento-de-seguranca.md).
- Resposta: [Resposta a incidentes (#222)](../../quality/resposta-a-incidentes.md).

## Histórico de revisões

| Versão | Data | Autor | Resumo das alterações |
|--------------|-----------|-------------|----------------|
| 0.1 | 2026-04-01 | BizCode | Stub inicial |
| 0.2 | 2026-07-30 | BizCode | Evidência de produto de monitoramento (#221) |
