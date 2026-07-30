# Política de sanitización y retención de logs (GitHub #218)

## Alcance

Este documento cubre el **endurecimiento residual** tras el MVP de observabilidad ([#151](https://github.com/ayelenleclerc/BizCode/issues/151)): catálogo ampliado de redacción, auditoría de superficies fuera de Pino, reglas de retención/acceso y guardrail automatizado. **No** reimplementa métricas, health ni la base Pino (véase [observabilidad.md](observabilidad.md)).

La integración mock de impresión ([#153](https://github.com/ayelenleclerc/BizCode/issues/153) Fase 1, PR #311) queda **fuera de alcance**; drivers físicos fiscal/térmico siguen como seguimiento.

## Catálogo de campos sensibles

Los nombres canónicos están en [`server/logRedaction.ts`](../../../server/logRedaction.ts) (`SENSITIVE_LOG_FIELD_NAMES`). Se mapean a `redact.paths` de Pino vía `LOGGER_REDACT_PATHS` en [`server/logger.ts`](../../../server/logger.ts).

| Categoría | Campos (representativos) |
|-----------|--------------------------|
| Auth / sesión | `password`, `token`, `authorization`, `cookie`, `session`, `bearer`, `jwt`, `refreshToken`, `accessToken` |
| Cripto / certificados | `secret`, `privateKey`, `private_key`, `certificate`, `clientSecret` |
| Integraciones | `apiKey`, `api_key`, `smtpPassword`, `twilioAuthToken`, `x-api-key` (headers) |
| Pagos | `creditCard`, `cardNumber`, `cvv`, `cvc`, `cbu`, `aliasCbu` |

Objetos anidados y headers HTTP usan rutas wildcard (`*.password`, `req.headers.authorization`, etc.). Los logs serializados censuran con `[Redacted]` (véase [`tests/server/logger.test.ts`](../../../tests/server/logger.test.ts)).

## Auditoría de superficies de log (2026-06)

| Superficie | Riesgo | Acción |
|------------|--------|--------|
| API Express (`server/*`) | Solo `logger` estructurado; sin `console.*` | **OK** — líneas de request sin IP/UA por defecto ([#151](observabilidad.md)) |
| `server/middleware/errorHandler.ts` | Puede registrar `err.stack` en servidor | **Aceptado** — stacks solo servidor; respuestas API ocultan detalle en producción |
| Jobs/cron CLI (`scripts/*-job.ts`, `arca-retry-pending.ts`) | `console.log(JSON.stringify(...))` | **OK** — solo agregados (`processed`, `issued`, `failed`, `sent`, `skipped`) y `tenantId` |
| `scripts/bootstrap-superadmin.ts` | Registra username al crear | **OK** — sin contraseña; bootstrap solo operador |
| `scripts/inspect-dbf*.ts`, `migrate-from-dbf.ts` | **Muestras** DBF legacy a stdout | **Exento** — CLI solo operador; no logs de runtime API |
| Herramientas plan GitHub (`scripts/github/*`) | Mensajes operativos | **OK** — sin secretos en plantillas |

## Retención y acceso

| Entorno | Destino | Retención (política) | Quién accede |
|---------|---------|----------------------|--------------|
| Dev local | stdout / terminal | Solo sesión; sin recolección central | Estación del desarrollador |
| CI | Logs de GitHub Actions | Default de la plataforma (~90 días según política GitHub) | Mantenedores con acceso al repo |
| Producción (futuro) | Sink en host/orquestador (no definido en repo) | **TBD** al elegir destino — alinear con retención ops; backups de DB cubiertos por [#150](https://github.com/ayelenleclerc/BizCode/issues/150) | `audit.read` para **métricas**; logs crudos restringidos a ops de plataforma |

`GET /api/metrics` sigue siendo solo agregados y requiere `audit.read` cuando está habilitado ([#151](observabilidad.md)). No exponer logs crudos por API.

## Guardrail preventivo

```bash
npm run check:logs
```

Implementado en [`scripts/check-log-sanitization.ts`](../../../scripts/check-log-sanitization.ts): falla si `scripts/**/*.ts` no exentos usan `console.*` con fragmentos prohibidos (`req.body`, `password:`, `token:`, etc.). Las exenciones están en ese script y en la tabla de auditoría.

CI lo ejecuta vía `npm run docs:validate` (junto con checks OpenAPI).

## Backlog relacionado (diferido)

| Issue | Decisión |
|-------|----------|
| [#150](https://github.com/ayelenleclerc/BizCode/issues/150) backup automático PostgreSQL | **Entregado** en repo (#150): backups locales cifrados + S3 CLI opcional; ver [backup-y-restauracion.md](backup-y-restauracion.md). El destino centralizado de **logs** sigue TBD. |
| [#152](https://github.com/ayelenleclerc/BizCode/issues/152) pipelines staging/producción | Diferido hasta servidor, dominio y targets de deploy |
| [#153](https://github.com/ayelenleclerc/BizCode/issues/153) hardware fiscal/térmico | Fase 1 (mock) entregada; drivers RS-232/ESC/POS reales pendientes |

Headers HTTP de seguridad de la API: evidencia en [#214](https://github.com/ayelenleclerc/BizCode/issues/214), [`server/middleware/securityHeaders.ts`](../../../server/middleware/securityHeaders.ts) y [`tests/server/security-headers.test.ts`](../../../tests/server/security-headers.test.ts).

## Validación

```bash
npm run check:logs
npm run test -- tests/server/logger.test.ts tests/server/security-headers.test.ts
```
