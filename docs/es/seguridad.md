# Seguridad

## Política de seguridad de la información (SGSI) (#196)

Sección de **política de seguridad de la información de producto** BizCode (ISO-ready). **No** afirma certificación ISO/IEC 27001. La aprobación organizacional de esta revisión se registra cuando la autoridad de producto fusiona el PR de documentación de [#196](https://github.com/ayelenleclerc/BizCode/issues/196).

### Objetivos

- Proteger confidencialidad, integridad y disponibilidad de los datos de negocio de tenants.
- Aplicar mínimo privilegio vía roles y permisos.
- Detectar, responder y aprender de eventos de seguridad con procedimientos documentados.
- Mantener cambios de ingeniería revisables (PR a `develop`, gates CI) sin inventar controles sin evidencia.

### Roles (producto)

| Rol | Responsabilidades de seguridad |
|-----|--------------------------------|
| Product owner / operadores SuperAdmin | Aprobar revisiones de política; operar herramientas de tenant/sesión; escalar incidentes |
| Ingeniería | Implementar controles; docs fieles al código; remediar hallazgos High+ de CI |
| Operadores de plataforma | Seguir runbooks de backup, deploy e incidentes; no commitear secretos |

### Declaraciones de política

1. El acceso a APIs y datos requiere sesión autenticada y comprobaciones de permiso en el servidor.
2. Los secretos viven en configuración de entorno (o gestores aprobados); nunca se commitean.
3. Producción y staging permanecen separados; no se usan datos de clientes de producción para DAST abierto sin aprobación explícita.
4. Los incidentes siguen [respuesta-a-incidentes.md](quality/respuesta-a-incidentes.md).
5. Privacidad y derechos del titular siguen [privacidad-y-derechos-del-titular.md](quality/privacidad-y-derechos-del-titular.md).
6. Aplicabilidad y brechas del Anexo A: [analisis-brechas-anexo-a-iso27001.md](quality/analisis-brechas-anexo-a-iso27001.md) y [SEC-002](certificacion-iso/sec/sec-002-declaracion-aplicabilidad-soa.md).

### Revisión

Al menos anual, o tras cambios materiales de arquitectura/seguridad, o tras hallazgos de pentest externo (#194).

### Stub controlado

[SEC-001 Política de seguridad de la información](certificacion-iso/sec/sec-001-politica-seguridad-informacion.md)

## Modelo de amenazas (STRIDE — resumido)

| Amenaza | Categoría | Mitigación |
|---|---|---|
| Inyección SQL vía API | Manipulación | Prisma parametrizado; `$queryRaw` / `Prisma.sql` etiquetado cuando hace falta SQL crudo (parámetros enlazados, sin concatenar input). Health: `SELECT 1` constante |
| XSS en datos mostrados | Manipulación | JSX escapa valores |
| Acceso no autorizado a la API | Elevación de privilegios | Cookie de sesión + permisos; escritorio suele ser loopback; SaaS/hosted requiere TLS y controles de red |
| Datos sensibles en logs | Divulgación | Sin PII en INFO; no registrar tokens, contraseñas ni secretos de pago |
| Vulnerabilidades en dependencias | Varias | `pnpm audit --audit-level=high` bloqueante; Snyk en CI — [escaneo de dependencias](quality/escaneo-dependencias-y-triage.md) |
| Rutas maliciosas en Tauri | Manipulación | Allowlist de filesystem |

## Mapeo OWASP Top 10

| Riesgo | Estado |
|---|---|
| A01 Control de acceso roto | Parcial — sesión y permisos ([`apps/server/createApp.ts`](../../apps/server/createApp.ts)); IDOR/tenant es foco de pentest ([#194](https://github.com/ayelenleclerc/BizCode/issues/194)) |
| A02 Fallos criptográficos | Parcial — secretos en env / tokens cifrados donde aplica |
| A03 Inyección | Mitigado — Prisma + plantillas etiquetadas |
| A04 Diseño inseguro | Parcial — modelo revisado; SaaS amplía superficie vs desktop |
| A05 Configuración insegura | Parcial — CORS allowlist; Helmet/CSP en [`securityHeaders.ts`](../../apps/server/middleware/securityHeaders.ts) |
| A06 Componentes vulnerables | Monitorizado — audit HIGH+ bloqueante; Snyk con `SNYK_TOKEN` |
| A07 Fallos de identificación | Parcial — login/sesión; hash de contraseña |
| A09 Fallos de registro | Parcial — observabilidad; eventos de seguridad (#221) |

## Cabeceras HTTP de seguridad

Helmet vía [`getSecurityHeadersMiddleware`](../../apps/server/middleware/securityHeaders.ts) en `createApp`. CSP permite inline limitado para Swagger en `/api-docs`.

## Gestión de secretos

- `DATABASE_URL` en `.env` (no versionado).
- `.env.example` solo nombres de variables y marcadores no secretos; el archivo versionado no debe contener credenciales reales.
- Bootstrap de super admin (`npm run bootstrap:superadmin`): contraseña vía `BIZCODE_BOOTSTRAP_SUPERADMIN_PASSWORD` solo en tu `.env` local.
- Sin secretos en el código.

## Seed de Prisma (arranque en desarrollo)

- `npx prisma db seed` crea o actualiza el tenant `platform` y el usuario `ayelen` (SuperAdmin). **`BIZCODE_SEED_SUPERADMIN_PASSWORD` debe estar definida** en `.env` (mínimo 8 caracteres).
- **No** reutilices la misma contraseña de desarrollo en preproducción, producción ni bases compartidas.

## CORS

La app Express usa **`cors`** con **`credentials: true`**.

- **Lista blanca:** por defecto `http://localhost:5173` y `http://127.0.0.1:5173`, más **`CORS_ORIGINS`** (CSV).
- **Código:** [`apps/server/createApp.ts`](../../apps/server/createApp.ts).
- **Pruebas:** [`tests/server/cors.test.ts`](../../tests/server/cors.test.ts).

## Política de dependencias

- `pnpm audit --audit-level=high` **bloqueante** en Quality Gate.
- Snyk cuando existe `SNYK_TOKEN` ([`.github/workflows/snyk.yml`](../../.github/workflows/snyk.yml)).
- Ver [escaneo y triage](quality/escaneo-dependencias-y-triage.md).

## Pruebas de penetración (#194)

DAST automatizado (OWASP ZAP baseline) y proceso de engagement externo: [Pruebas de penetración](quality/pruebas-de-penetracion.md). Los informes ZAP de CI **no** sustituyen el informe de pentest externo.

## Checklist pre-lanzamiento (ingeniería)

| Comprobación | Evidencia |
|---|---|
| Gates HIGH+ de dependencias | Quality Gate; Snyk |
| Revisión SQL crudo | `$queryRaw` / `Prisma.sql` etiquetado; guardrail `npm run check:raw-sql` falla ante `$queryRawUnsafe` / `$executeRawUnsafe` bajo `apps/server` |
| Cabeceras de seguridad | Helmet en la API |
| Tenant / IDOR | Middleware de auth; el pentest externo debe verificar acceso cross-tenant |
| Secretos en logs | Revisar sinks de producción antes del lanzamiento |

## Respuesta a incidentes (#222)

[Respuesta a incidentes](quality/respuesta-a-incidentes.md).

## Monitoreo de seguridad (#221)

[Monitoreo de seguridad](quality/monitoreo-de-seguridad.md). Stub ISO: [SEC-011](certificacion-iso/sec/sec-011-logs-alertas.md).

## Hardening apps móviles (#220)

[Hardening apps móviles](quality/hardening-apps-moviles.md).

**Otros idiomas:** [English](../en/security.md) · [Português](../pt-br/seguranca.md)
