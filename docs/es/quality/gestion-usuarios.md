# Gestión de usuarios — registro de implementación

## Alcance

Implementa la interfaz de administración de usuarios de BizCode (issue #25): listar, crear, actualizar y desactivar usuarios dentro de un tenant, más un endpoint de cambio de contraseña propio.

## Backend (`server/users.ts`)

| Endpoint | Permiso requerido | Descripción |
|---|---|---|
| `GET /api/users` | `users.manage` | Lista todos los usuarios del tenant del caller (sin hash de contraseña) |
| `POST /api/users` | `users.manage` + `roles.assign` | Crea un usuario; contraseñas hasheadas con scrypt vía `server/passwordHash.ts` |
| `PUT /api/users/:id` | `users.manage` | Actualiza rol, estado activo o scope; bloquea auto-desactivación |
| `POST /api/auth/change-password` | autenticado | Cambia la propia contraseña verificando la actual |

### Restricción de asignación de roles

Los callers solo pueden asignar roles con rango igual o inferior al propio (ver `ROLE_RANK` en `server/users.ts`). Un `manager` no puede promover a un usuario a `owner`.

## Frontend

- **`src/pages/users/index.tsx`** — DataTable con búsqueda, navegación por teclado (F2/F3/F5/Esc/Flechas) y doble clic para editar.
- **`src/pages/users/UserForm.tsx`** — modal de creación/edición; selector de rol restringido a roles asignables; toggle múltiple de canales.
- **`src/components/CanAccess.tsx`** — renderiza hijos solo si el usuario autenticado posee el `Permission` indicado. Usado para mostrar/ocultar el botón "Nuevo Usuario" y el link del sidebar.

## Integración RBAC

Los permisos `users.manage` y `roles.assign` están definidos en [`src/lib/rbac.ts`](../../../src/lib/rbac.ts) y asignados a `super_admin` y `owner`.

## Pruebas

- **`tests/api/users.test.ts`** — 17 tests unitarios cubriendo allow/deny para todos los endpoints usando el patrón de mock de Prisma.

## OpenAPI

Nuevos paths y schemas añadidos a [`docs/api/openapi.yaml`](../../../docs/api/openapi.yaml):
- `GET /api/users`, `POST /api/users`, `PUT /api/users/{id}`, `POST /api/auth/change-password`
- Schemas: `AppUser`, `AppUserInput`, `AppUserUpdateInput`, `AppUserListEnvelope`, `AppUserEnvelope`, `ChangePasswordInput`

## Relacionados

- Matriz RBAC: [`docs/es/quality/matriz-rbac-roles-permisos-scopes.md`](matriz-rbac-roles-permisos-scopes.md)
- Modelo IAM: [`docs/es/quality/modelo-iam-sesiones-auditoria.md`](modelo-iam-sesiones-auditoria.md)
- SEC-005 gestión de accesos: [`docs/es/certificacion-iso/sec/sec-005-gestion-accesos-usuario.md`](../certificacion-iso/sec/sec-005-gestion-accesos-usuario.md)
