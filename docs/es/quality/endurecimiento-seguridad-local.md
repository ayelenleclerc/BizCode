# BizCode Local — endurecimiento de seguridad (#538)

**Propósito:** Modelo de amenazas, controles, verificación y guía de configuración segura para **BizCode Local** (programa distribuidora [#535](https://github.com/ayelenleclerc/BizCode/issues/535)). Complementa [seguridad.md](../seguridad.md); **no** reemplaza controles SaaS ni promete seguridad absoluta.

**Relacionado:** [topologia-despliegue-local.md](topologia-despliegue-local.md) / [ADR-0029](../adr/ADR-0029-local-deployment-topology.md) (#537), [matriz-alcance-local-distribuidora.md](matriz-alcance-local-distribuidora.md) (#536), [modelo-iam-sesiones-auditoria.md](modelo-iam-sesiones-auditoria.md), [matriz-rbac-roles-permisos-scopes.md](matriz-rbac-roles-permisos-scopes.md), [gestion-secretos-y-doppler.md](gestion-secretos-y-doppler.md), [respuesta-a-incidentes.md](respuesta-a-incidentes.md), [readiness-seguridad-precomercial.md](readiness-seguridad-precomercial.md) (#194), [backup-y-restauracion.md](backup-y-restauracion.md).

**Baseline:** `develop` post-#537.

## Leyenda de estado

| Estado | Significado |
|---|---|
| **verificado** | Control + prueba automatizada o comando documentado con evidencia |
| **parcial** | Control existe; residual específico Local |
| **pendiente** | Brecha (#539 instalador/updater, #194 pentest externo, etc.) |

## Matriz de amenazas (Local)

| Superficie | Ataque / fallo | Control (evidencia) | Prueba / verificación | Riesgo residual | Estado |
|---|---|---|---|---|---|
| Host principal API | Bind en todas las interfaces | `BIZCODE_LISTEN_HOST`; default `127.0.0.1` si `NODE_ENV` es `development`/`test` | `tests/server/server.test.ts`, `env.test.ts` | LAN explícito requiere firewall OS | verificado |
| PostgreSQL | Exposición a Internet | Ops: solo localhost/LAN; no abrir `5432` público | Checklist manual; instalador → #539 | Error de operador | parcial |
| Puesto | Sesión robada / rol débil | `requirePermission`, tenant/RLS, scopes | `authz`, `tenant-isolation`, `rls-isolation` | Usuario OS privilegiado en el principal | verificado |
| Tokens | Inválido / expirado / refresh revocado | Sesión + rotación refresh | `auth-session`, `auth-refresh`, `auth-lockout` | Cookie `Secure` + HTTP LAN | parcial |
| MFA | Bypass TOTP | Flujos MFA si están habilitados | `auth-mfa.test.ts` | No forzado en todos los roles Local | parcial |
| Secretos | Fuga API/logs/exports | Zod env; errores prod sin stack; `.env.example` vacío | Tests env; CI secret scan | Almacén DPAPI **Not evidenced** | parcial |
| Shell Tauri | XSS / update sin firma | `csp: null`; solo `shell.open`; sin updater | Revisión `src-tauri` | Integridad updates → #539 | pendiente |
| Portal / webhooks | Edge público sin TLS | Topología: edge controlado o hosted | Tests portal / allowlists | API solo-LAN sin túnel | parcial |
| Conectores | Abuso de credenciales | Secretos en env; módulos | Tests de dominio + mocks | Credenciales live fuera del baseline | parcial |
| Instalador / updates | Binario alterado | **Not evidenced** | — | #539 | pendiente |
| Pentest externo | High/Critical desconocidos | CI parcial; registro vacío | #194 | Keep-OPEN | pendiente |

## Evidencia de autorización negativa

```bash
pnpm exec vitest run tests/api/authz.test.ts tests/api/auth-session.test.ts tests/api/auth-refresh.test.ts tests/api/tenant-isolation.test.ts tests/api/rls-isolation.test.ts tests/api/portal-isolation.test.ts tests/server/server.test.ts tests/server/env.test.ts
```

## Manual de configuración segura (Local)

### Instalación individual

1. Default API en **`127.0.0.1`** (`NODE_ENV=development`/`test`, o `BIZCODE_LISTEN_HOST=127.0.0.1`).
2. PostgreSQL solo localhost; firewall Windows sin inbound `5432` externo.
3. Secretos solo en el PC principal; **no** copiar `.env` a cada puesto.
4. **No** desactivar antivirus/firewall como paso de instalación.
5. Preferir loopback o TLS en proxy; cookie `Secure` puede fallar en HTTP LAN no-loopback.

### LAN multi-puesto

1. `BIZCODE_LISTEN_HOST` = IP LAN del principal (o `0.0.0.0` solo con firewall de subred).
2. Abrir solo el puerto API (`3001`); Postgres **no** alcanzable desde puestos.
3. `CORS_ORIGINS` explícito si hace falta.
4. Residual aprobado: HTTP LAN sin TLS.

### Rotación / recuperación

1. Rotar `JWT_SECRET` con `JWT_SECRET_PREVIOUS`.
2. Rotar claves fiscal/MFA según helpers existentes; invalidar sesiones.
3. Restore según [backup-y-restauracion.md](backup-y-restauracion.md); automatización Local → #540.

### Incidentes

Seguir [respuesta-a-incidentes.md](respuesta-a-incidentes.md). Extra Local: aislar host; revocar sesiones; rotar secretos; preservar auditoría sin filtrar PII.

## Escaneos

Ejecutar jobs CI equivalentes (audit/gitleaks) y adjuntar SHA + resultado al PR. Pentest externo → **#194** OPEN.

## Residuales

- CSP/updater Tauri → **#539**
- Instalador → **#539**
- Pentest contratado → **#194**

## Otros idiomas

[English](../../en/quality/local-security-hardening.md) · [Português (Brasil)](../../pt-br/quality/endurecimento-seguranca-local.md)
