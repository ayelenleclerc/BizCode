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

Resumido en la versión en inglés; en el alcance actual muchos riesgos son N/A (app desktop monousuario sin autenticación en API).

## Gestión de secretos

- `DATABASE_URL` en `.env` (no versionado).
- `.env.example` solo placeholders.
- Sin secretos en el código.

## Seed de Prisma (arranque en desarrollo)

- `npx prisma db seed` crea o actualiza el tenant `platform` y el usuario `ayelen` (SuperAdmin). **`BIZCODE_SEED_SUPERADMIN_PASSWORD` debe estar definida** en `.env` antes de ejecutar el seed (mínimo 8 caracteres). [`.env.example`](../../.env.example) declara la variable **sin** valor por defecto versionado.
- **No** reutilices la misma contraseña de desarrollo en preproducción, producción ni bases compartidas. Usa un secreto fuerte por entorno; volver a ejecutar el seed sobrescribe el hash almacenado de ese usuario.

## CORS

No configurado (solo WebView local). Si la API se expone a red, añadir `cors` con lista blanca explícita.

## Política de dependencias

`npm audit --audit-level=high` en CI; críticas/altas antes de merge a `main`.

**Otros idiomas:** [English](../en/seguridad.md) · [Português](../pt-br/seguridad.md)
