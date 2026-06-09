# Observabilidad MVP (Issue #151)

## Alcance

BizCode incorpora una capa base de observabilidad para operación backend sin infraestructura externa de monitoreo:

- Logs JSON estructurados con `pino`.
- Correlación por request mediante `X-Request-Id`.
- Métricas técnicas en memoria mediante `GET /api/metrics`.
- Health extendido de forma aditiva en `GET /api/health`.

Fuera de alcance en este MVP: Prometheus, Grafana, Loki, Datadog, Sentry y alertas operativas reales (email/Slack/WhatsApp).

## Logs estructurados

- El nivel de log se define por `LOG_LEVEL` (por defecto `info`, `silent` en tests).
- Se redactan campos sensibles vía `LOGGER_REDACT_PATHS` en [`server/logRedaction.ts`](../../../server/logRedaction.ts) (claves base de #151; catálogo ampliado y auditoría en [politica-sanitizacion-logs.md](politica-sanitizacion-logs.md) — #218).
- Los logs de request guardan solo metadatos operativos (`requestId`, `method`, `path` normalizado, `statusCode`, `durationMs`; `tenantId` y `userId` cuando existan en servidor).
- No se loguea el `req.body` completo.

Privacidad por defecto:

- IP y User-Agent **no** se registran por defecto en la línea de acceso por request.

## Endpoint de métricas

`GET /api/metrics` devuelve agregados técnicos en memoria y requiere permiso `audit.read`.

Reglas de seguridad y minimización:

- No expone tenantId, userId, IP, User-Agent ni payloads por request.
- Las rutas se normalizan para evitar cardinalidad alta y fuga de identificadores reales.
- Si `METRICS_ENABLED=false`, responde `404 Not found`.

## Endpoint health

`GET /api/health` mantiene compatibilidad (`status`, `timestamp`) y agrega:

- Resultado de check de DB (`db.ok`) y latencia del check (`db.latencyMs`).
- `uptimeSeconds`.
- `version` cuando está disponible en runtime.

## Límites del runtime y evolución futura

Las métricas actuales son:

- En memoria.
- Volátiles (se reinician al reiniciar proceso).
- No persistentes ni agregadas entre múltiples instancias.

Este MVP prepara el camino para futuras integraciones (Prometheus/Grafana/Loki/Sentry) cuando exista infraestructura y canales operativos definidos.

## Validación local

Ejecutar:

```bash
npm run check:openapi
npm run check:openapi-sync
npm run test
```

Gate completo (incluye documentación generada):

```bash
npm run type-check
npm run lint
npm run check:i18n
npm run check:docs-map
npm run check:openapi
npm run check:openapi-sync
npm run test
npm run docs:generate
npm run docs:validate
```
