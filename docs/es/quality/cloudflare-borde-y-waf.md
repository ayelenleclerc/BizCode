# Cloudflare borde y WAF (#217)

## Propósito

Checklist de operador para colocar **Cloudflare** delante del API/origen BizCode. La aplicación **no** llama APIs de Cloudflare; la configuración de borde vive en el panel de Cloudflare (o IaC fuera de este repo).

Decisión normativa: [ADR-0016](../adr/ADR-0016-waf-y-rate-limiting.md).

## Companion en la capa de aplicación

BizCode aplica rate limits HTTP en Express (`apps/server/middleware/routeRateLimit.ts`) con **store Redis** si hay `REDIS_URL` (obligatorio en producción). Detrás de Cloudflare hay que setear:

| Variable | Valor típico | Motivo |
|----------|--------------|--------|
| `TRUST_PROXY` | `1` | Para que Express `req.ip` sea la IP del cliente (CF → origen = 1 hop) |
| `REDIS_URL` | URL de Redis | Contadores compartidos entre instancias |
| `WEBHOOK_IP_ALLOWLIST` | CSV opcional de IPs del proveedor | Si está seteado, webhooks responden 403 a otras IPs |

**No** inventar IDs de cuenta ni nombres de zona Cloudflare en este repositorio.

## Checklist de operador (Cloudflare Free mínimo)

1. **DNS / proxy:** Hostname público en Cloudflare; nube naranja (proxied) hacia el origen.
2. **SSL/TLS:** Full (strict) si el origen tiene certificado válido; si no, Full hasta tener TLS en origen. Preferir certificados gestionados en el borde.
3. **Regla WAF (auth):** Rate-limit o bloqueo ~100 req/min hacia `/api/auth*` (presupuesto de borde; la app también aplica 5 intentos de login / 15 min por IP).
4. **Bot Fight / challenge:** Activar challenge gestionado para bots conocidos si la UX lo permite.
5. **Geo (opcional):** Bloquear o desafiar países de alto riesgo solo con lista aprobada por producto/ops.
6. **Under Attack Mode:** Documentar cómo activarlo ante DDoS; implica challenges extra para humanos.
7. **Webhooks:** Preferir allowlist de origen vía `WEBHOOK_IP_ALLOWLIST` (mantenida por el operador desde docs del proveedor, p. ej. IPN Mercado Pago). Si Cloudflare está delante del webhook, evitar challenges incorrectos a IPs del proveedor.

## Local / CI

Cloudflare no es obligatorio en local. Usar [`.env.example`](../../../.env.example) y Redis opcional con `docker compose -f docker-compose.redis.yml up -d`.

## Fuera de alcance en la app

- Workers, Terraform o tokens de API Cloudflare en este repo
- `express-slow-down` (v1)
- Rangos IP de terceros hardcodeados (cambian; mantenerlos en env/ops)
