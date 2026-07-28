# Gestión de secretos y Doppler (#216)

## Propósito

Documentar cómo BizCode carga configuración sensible en producción frente a local/CI, sin SDKs de proveedor cloud en la aplicación.

Decisión normativa: [ADR-0015](../adr/ADR-0015-gestion-secretos.md).

## Modelo

| Entorno | Cómo llegan los secretos al proceso |
|---------|-------------------------------------|
| Desarrollo local | `.env` gitignored (copiar de [`.env.example`](../../../.env.example)) |
| CI (GitHub Actions) | `env:` del workflow / secretos del repositorio |
| Producción | **Doppler** (o equivalente) inyecta env al arrancar. **No** montar un `.env` de producción con valores reales en la imagen/repo |

La API siempre lee variables validadas en `apps/server/config/env.ts`.

## Inventario canónico (sensibles)

| Variable | Rol |
|----------|-----|
| `DATABASE_URL` | Conexión PostgreSQL (incluye password de DB) |
| `JWT_SECRET` | Clave HMAC actual para hashes de tokens opacos |
| `JWT_SECRET_PREVIOUS` | Clave HMAC previa opcional en rotación |
| `BIZCODE_FISCAL_ENCRYPTION_KEY` | Clave maestra AES-256-GCM AFIP/MP (**obligatoria en production**) |
| `BIZCODE_MFA_ENCRYPTION_KEY` | Clave AES-256-GCM TOTP (**obligatoria en production**; no reutilizar la fiscal) |
| `REDIS_URL` | Redis (blacklist refresh, desafíos MFA, **store de rate-limit HTTP** — **obligatorio en producción**, #217) |
| `SMTP_*` / `TWILIO_*` | Canales salientes opcionales |

## Rotación de `JWT_SECRET`

1. Poner el valor **viejo** en `JWT_SECRET_PREVIOUS`.
2. Poner el valor **nuevo** en `JWT_SECRET`.
3. Reiniciar instancias de forma gradual.
4. Quitar `JWT_SECRET_PREVIOUS` cuando expire el material hasheado con el secreto viejo.

## AES

La rotación de claves AES implica re-cifrar ciphertext almacenado (fuera del alcance automatizado de #216).

## Checklist Doppler

1. Proyecto/config Doppler por entorno.
2. Cargar el inventario como secretos Doppler.
3. Arrancar con inyección (`doppler run -- …` o sync a env del contenedor).
4. Verificar `NODE_ENV=production` y claves fiscal/MFA.
5. Separar secretos de deploy CI/SSH de los de runtime cuando corresponda.

## CI: Gitleaks

Workflow `.github/workflows/gitleaks.yml`. Allowlist mínima en `.gitleaks.toml` si hace falta.

## Auditoría de historial

```bash
git log --all --full-history -- "**/.env*"
```

Si hay secretos reales: rotar credenciales y planificar rewrite de historial aparte.

Plantilla: [`docs/evidence/secrets-env-history-audit.md`](../../evidence/secrets-env-history-audit.md).
