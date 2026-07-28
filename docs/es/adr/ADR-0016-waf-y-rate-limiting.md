# ADR-0016: Contrato WAF de borde (Cloudflare) + rate limiting con Redis

**Estado:** Aceptado  
**Fecha:** 2026-07-28  
**Referencia ISO:** ISO/IEC 27001:2022 A.8.9 (gestión de configuración); A.8.20 (seguridad de redes); A.5.15 (control de acceso)

---

## Contexto

BizCode ya aplica rate limits HTTP por ruta con `express-rate-limit` (#87) usando un **store en memoria del proceso**, clave principalmente por IP, montado antes de resolver sesión. Redis (`REDIS_URL`) sirve blacklist de refresh (#212) y desafíos MFA (#213), no contadores HTTP. El issue #217 exige límites seguros multi-instancia, claves autenticado vs anónimo, login más estricto, `Retry-After` en 429 y postura WAF Cloudflare documentada. **No** hay SDK Cloudflare en el repositorio.

## Decisión

1. **Cloudflare = contrato de despliegue (solo docs):** el operador coloca Cloudflare (Free mínimo) delante del origen y activa WAF/bot/geo/SSL/Under Attack Mode según la guía. La app **no** llama APIs de Cloudflare en v1. La guía vive bajo `docs/*/quality/` vía [`DOCUMENT_LOCALE_MAP.md`](../../DOCUMENT_LOCALE_MAP.md) (no un `docs/deployment/cloudflare.md` monolingüe).
2. **Store de rate limit:** `rate-limit-redis` + `ioredis` compartido si hay `REDIS_URL`; si no, memoria (local/una instancia). Prefijos `bizcode:rl:*`. En `NODE_ENV=production`, `REDIS_URL` es **obligatorio** (fail-fast en `loadAppConfig`).
3. **Trust proxy:** `TRUST_PROXY` opcional (hops, típicamente `1` detrás de Cloudflare) configura Express `trust proxy` para que `req.ip` sea el cliente. Por defecto off en local.
4. **Orden de middleware:** limiters generales de API **después** de `express.json()` y `resolveSession` para clavar por `userId`. Limiters de login IP/username en rutas `/api/auth` con body JSON.
5. **Límites por defecto (override por env):** login **5 / 15 min por IP**; login **10 / hora por tenant+username**; API no autenticada **20 / min por IP**; API autenticada **100 / min por usuario**; reportes/exports **10 / hora por tenant**; limiters import/portal/MP existentes se conservan con Redis cuando hay URL.
6. **Webhooks:** `WEBHOOK_IP_ALLOWLIST` opcional (IPs separadas por coma). Si está seteado, IP no listada → **403**. Rangos Mercado Pago **no** hardcodeados.
7. **Fuera de alcance v1:** `express-slow-down`, automatización Cloudflare, scanning de dependencias (#219).

## Consecuencias

- **Positivo:** límites multi-instancia; presupuestos AC; WAF de borde documentado sin inventar IDs de cuenta; evidencia ISO de red/acceso.
- **Negativo:** prod exige Redis; `TRUST_PROXY` mal configurado permite spoofing; coexisten lockout DB (`ACCOUNT_LOCKED`) y HTTP 429.
- **Pruebas:** suite de rate limit (#87) ampliada; casos login/`Retry-After`/user-vs-IP; store Redis cuando hay `REDIS_URL`.

## Referencias

- Issue #217
- [ADR-0015: Gestión de secretos](ADR-0015-gestion-secretos.md)
- [Cloudflare borde y WAF](../quality/cloudflare-borde-y-waf.md)
