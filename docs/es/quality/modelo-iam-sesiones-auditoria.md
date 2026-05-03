# Modelo IAM — datos, sesiones y auditoría

Describe el modelo de identidad y acceso **actual** tal como está implementado en el repositorio. No describe tablas futuras como `role_permissions` en base de datos; los permisos se derivan del rol del usuario en código ([`ROLE_PERMISSIONS`](../../../src/lib/rbac.ts)).

## Modelo de datos (Prisma)

Definido en [`prisma/schema.prisma`](../../../prisma/schema.prisma):

| Modelo | Propósito |
|--------|-----------|
| `Tenant` | Límite organizacional (`name`, `slug`, `active`). |
| `AppUser` | Usuario en un tenant: `username`, `passwordHash`, `role` (enum alineado con roles RBAC), `active`, arrays de alcance (`scopeBranchIds`, `scopeWarehouseIds`, `scopeRouteIds`, `scopeChannels`). |
| `AppSession` | Sesión en servidor: `tokenHash`, `expiresAt`, `revokedAt`, `lastSeenAt`, `userAgent` / `ipAddress` opcionales. |
| `AuditEvent` | Registro tipo append-only: `tenantId`, `userId` opcional, `action`, `resource`, `resourceId` opcional, `ipAddress` opcional, `metadata` (JSON). |

## Flujo de sesión y claims

1. **Middleware:** [`resolveSession`](../../../server/auth.ts) se ejecuta en cada petición (registrado en [`server/createApp.ts`](../../../server/createApp.ts)). Lee la cookie `bizcode_session`, busca un `AppSession` no revocado y vigente, carga `AppUser`, normaliza rol y canales, y adjunta `req.auth` con `AuthClaims` (incluye permisos de `ROLE_PERMISSIONS`).
2. **Bypass en pruebas:** Si `NODE_ENV === 'test'` y `BIZCODE_TEST_AUTH_BYPASS` no es `'false'`, se inyecta un `req.auth` sintético (véase [`server/auth.ts`](../../../server/auth.ts)).
3. **Login:** `POST /api/auth/login` valida tenant + usuario, crea `AppSession`, fija la cookie de sesión (`HttpOnly`, `SameSite=None`, `Secure`), escribe `AuditEvent` con acción `login`.
4. **Bootstrap:** `POST /api/auth/setup-owner` crea el primer tenant y owner cuando no hay usuarios; registra `setup_owner` en `AuditEvent` (vía `writeAuditEvent`).
5. **Logout:** `POST /api/auth/logout` revoca sesiones coincidentes por hash de cookie, limpia la cookie y puede escribir `logout` en `AuditEvent` si hay `req.auth`.
6. **Usuario actual:** `GET /api/auth/me` devuelve `req.auth.claims` o `401` si no hay autenticación.

**No evidenciado en el código actual:** la cabecera HTTP `x-bizcode-channel` no se lee en `server/auth.ts` ni `server/createApp.ts`; los canales vienen solo de `AppUser.scopeChannels` persistido.

## Auditoría en aplicación (mutaciones)

[`server/createApp.ts`](../../../server/createApp.ts) escribe filas de auditoría en mutaciones seleccionadas (p. ej. `cliente_create`, `factura_create`) vía `prisma.auditEvent.create`, usando `req.auth.claims`. Los fallos se ignoran para no bloquear la operación de negocio.

## OpenAPI frente a auth en tiempo de ejecución

[`docs/api/openapi.yaml`](../../api/openapi.yaml) describe paths y respuestas pero **no** declara `security` / `securitySchemes` por operación. La tabla siguiente refleja el comportamiento **Express** en `server/createApp.ts` y `server/auth.ts`.

## Endpoint → autenticación y permiso

| Método | Ruta | Autenticación | Permiso (`requirePermission`) |
|--------|------|---------------|-------------------------------|
| `GET` | `/api/health` | Ninguna | Ninguno |
| `POST` | `/api/auth/setup-owner` | Ninguna | Ninguno |
| `POST` | `/api/auth/login` | Ninguna | Ninguno |
| `POST` | `/api/auth/logout` | Cookie opcional; el handler siempre responde con éxito | Ninguno |
| `GET` | `/api/auth/me` | Sesión obligatoria (`req.auth`) | Ninguno |
| `GET` | `/api/clientes` | Sesión + permiso | `customers.read` |
| `GET` | `/api/clientes/{id}` | Sesión + permiso | `customers.read` |
| `POST` | `/api/clientes` | Sesión + permiso | `customers.manage` |
| `PUT` | `/api/clientes/{id}` | Sesión + permiso | `customers.manage` |
| `GET` | `/api/articulos` | Sesión + permiso | `products.read` |
| `GET` | `/api/articulos/{id}` | Sesión + permiso | `products.read` |
| `POST` | `/api/articulos` | Sesión + permiso | `products.manage` |
| `PUT` | `/api/articulos/{id}` | Sesión + permiso | `products.manage` |
| `GET` | `/api/rubros` | Sesión + permiso | `products.read` |
| `POST` | `/api/rubros` | Sesión + permiso | `products.manage` |
| `GET` | `/api/formas-pago` | Sesión + permiso | `sales.create` |
| `GET` | `/api/facturas` | Sesión + permiso | `reports.operational.read` |
| `POST` | `/api/facturas` | Sesión + permiso | `sales.create` |

## Pruebas

- Sesión y flujos de auth: [`tests/api/auth-session.test.ts`](../../../tests/api/auth-session.test.ts)
- Autorización (comprobación de permisos): [`tests/api/authz.test.ts`](../../../tests/api/authz.test.ts)
- **`tests/server/scope-channel.test.ts`:** no existe en el repositorio en la fecha de este documento.

## Documentos relacionados

- Matriz RBAC: [matriz-rbac-roles-permisos-scopes.md](matriz-rbac-roles-permisos-scopes.md)
- Ejecución del plan maestro: [ejecucion-plan-maestro-bizcode.md](ejecucion-plan-maestro-bizcode.md)
