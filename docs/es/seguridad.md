# Seguridad

## Modelo de amenazas (STRIDE — resumido)

| Amenaza | Categoría | Mitigación |
|---|---|---|
| Inyección SQL vía API | Manipulación | Prisma con consultas parametrizadas |
| XSS en datos mostrados | Manipulación | JSX escapa valores |
| Acceso no autorizado a la API | Elevación de privilegios | API en loopback (127.0.0.1) |
| Datos sensibles en logs | Divulgación | Sin PII en INFO |
| Vulnerabilidades en dependencias | Varias | `npm audit` en CI |
| Rutas maliciosas en Tauri | Manipulación | Allowlist de filesystem |

## Mapeo OWASP Top 10

| Riesgo | Estado |
|---|---|
| A01 Control de acceso roto | Parcial — sesión por cookie y comprobación de permisos en rutas protegidas ([`server/createApp.ts`](../../server/createApp.ts), [`server/auth.ts`](../../server/auth.ts)) |
| A02 Fallos criptográficos | N/A — sin secretos de aplicación en la base |
| A03 Inyección | Mitigado — Prisma parametrizado |
| A04 Diseño inseguro | Mitigado — modelo de amenazas; API en loopback |
| A05 Configuración insegura | Parcial — CORS con lista blanca y `credentials: true` ([`server/createApp.ts`](../../server/createApp.ts), `CORS_ORIGINS` en [`.env.example`](../../.env.example)); resto de cabeceras sin endurecer del todo |
| A06 Componentes vulnerables | Monitorizado — `npm audit` en CI |
| A07 Fallos de identificación | Parcial — login y sesión; hash de contraseña en [`server/auth.ts`](../../server/auth.ts) |
| A09 Fallos de registro | Parcial — sin logging estructurado aún |

## Gestión de secretos

- `DATABASE_URL` en `.env` (no versionado).
- `.env.example` solo nombres de variables y marcadores no secretos (p. ej. `REPLACE_DB_USER` / `REPLACE_DB_CREDENTIAL` en `DATABASE_URL`); el archivo versionado no debe contener credenciales reales.
- Bootstrap de super admin (`npm run bootstrap:superadmin`): contraseña vía `BIZCODE_BOOTSTRAP_SUPERADMIN_PASSWORD` solo en tu `.env` local (claves comentadas en `.env.example`; no subir valores reales).
- Sin secretos en el código.

## Seed de Prisma (arranque en desarrollo)

- `npx prisma db seed` crea o actualiza el tenant `platform` y el usuario `ayelen` (SuperAdmin). **`BIZCODE_SEED_SUPERADMIN_PASSWORD` debe estar definida** en `.env` antes de ejecutar el seed (mínimo 8 caracteres). [`.env.example`](../../.env.example) declara la variable **sin** valor por defecto versionado.
- **No** reutilices la misma contraseña de desarrollo en preproducción, producción ni bases compartidas. Usa un secreto fuerte por entorno; volver a ejecutar el seed sobrescribe el hash almacenado de ese usuario.

## CORS

La app Express usa **`cors`** con **`credentials: true`** para que el navegador envíe la cookie de sesión en peticiones cross-origin desde el servidor de desarrollo del SPA (por ejemplo Vite en el puerto **5173**) hacia la API en el puerto **3001**.

- **Lista blanca:** por defecto `http://localhost:5173` y `http://127.0.0.1:5173`, más orígenes extra en la variable **`CORS_ORIGINS`** (CSV); véase [`.env.example`](../../.env.example).
- **Código:** [`server/createApp.ts`](../../server/createApp.ts) (`getCorsOriginAllowlist`, `createApp`).
- **Pruebas:** [`tests/server/cors.test.ts`](../../tests/server/cors.test.ts).
- Las peticiones **sin** cabecera `Origin` (por ejemplo supertest en CI) se permiten; orígenes no listados no reciben `Access-Control-Allow-Origin`.
- **Escritorio empaquetado:** si el WebView usa otro origen, añádelo a `CORS_ORIGINS`.

## Política de dependencias

`npm audit --audit-level=high` en CI; críticas/altas antes de merge a `main`.

**Otros idiomas:** [English](../en/security.md) · [Português](../pt-br/seguranca.md)
