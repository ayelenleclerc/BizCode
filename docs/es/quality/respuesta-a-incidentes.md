# Respuesta a incidentes de seguridad (#222)

## Propósito

Runbook operativo para incidentes de seguridad en BizCode (escritorio, API SaaS o datos de tenant). Complementa el stub ISO [SEC-008](../certificacion-iso/sec/sec-008-gestion-incidentes.md) con acciones evidenciadas en el producto.

**Estado de evidencia:** Las herramientas de revocación de sesiones, deshabilitación de tenant y modo mantenimiento están en el panel super-admin y la API. Documento **ISO-ready**; no afirma certificación.

## 1. Clasificación de incidentes

| Severidad | Ejemplos | Tiempo de respuesta inicial |
|-----------|----------|-----------------------------|
| **Crítico** | Breach de datos de clientes; acceso no autorizado como `super_admin`; exfiltración masiva | Inmediato (minutos) |
| **Alto** | Exposición de credenciales; DB accesible públicamente; robo generalizado de tokens | Dentro de 1 hora |
| **Medio** | Compromiso de sesión de un usuario; MFA deshabilitado en cuenta privilegiada sin aprobación | Mismo día hábil |
| **Bajo** | Intentos fallidos de intrusión; brute force bloqueado sin login exitoso | Registro y revisión de tendencias |

## 2. Runbooks

### 2.1 Compromiso de credenciales / sesiones

1. Identificar usuarios o tenant afectados vía audit log / export forense.
2. **Revocar sesiones:** SuperAdmin → detalle del tenant → *Revocar todas las sesiones*, o `POST /api/superadmin/tenants/{tenantId}/revoke-all-sessions`.
3. Forzar cambio de password; reactivar MFA si fue deshabilitado.
4. Rotar secretos expuestos (Doppler / env) según [gestión de secretos](gestion-secretos-y-doppler.md).
5. Notificar al owner del tenant; registrar acciones en auditoría.

### 2.2 Compromiso o abuso activo del tenant

1. **Modo mantenimiento** (bloquea login/API de usuarios del tenant; el `super_admin` de plataforma sigue gestionando): `POST /api/superadmin/tenants/{tenantId}/maintenance` con `{ "enabled": true }` (también revoca sesiones).
2. Si se requiere aislamiento mayor: **Deshabilitar tenant** vía UI o `POST /api/superadmin/tenants/{tenantId}/disable`. Reactivar con `PATCH ... { "active": true }` cuando corresponda.
3. Export forense: `GET /api/superadmin/tenants/{tenantId}/audit-events?startDate=&endDate=`.
4. Conservar logs; no borrar filas de auditoría.

### 2.3 Base de datos o infraestructura expuesta

1. Cerrar exposición de red (firewall / security groups / Cloudflare).
2. Rotar `DATABASE_URL` y credenciales relacionadas.
3. Evaluar datos accedidos; seguir notificación legal si hay datos personales (§4).
4. Post-mortem (§5).

## 3. Herramientas de respuesta (producto)

| Acción | UI | API |
|--------|----|-----|
| Revocar sesiones del tenant | Detalle tenant | `POST /api/superadmin/tenants/{tenantId}/revoke-all-sessions` |
| Deshabilitar tenant | Detalle / Suspender | `POST /api/superadmin/tenants/{tenantId}/disable` |
| Modo mantenimiento | Detalle tenant | `POST /api/superadmin/tenants/{tenantId}/maintenance` |
| Listado forense de auditoría | Export en detalle | `GET /api/superadmin/tenants/{tenantId}/audit-events` |

**Mantenimiento vs deshabilitar:** El mantenimiento deja el tenant activo para operadores pero bloquea auth/API de usuarios finales. Deshabilitar (`active=false`) rechaza login hasta reactivación.

**Fuera de alcance del mantenimiento:** Los jobs en background del tenant no se pausan automáticamente; detenerlos manualmente si el incidente lo exige.

## 4. Notificaciones legales (Argentina)

Bajo la **Ley 25.326** y criterios de la **AAIP**, evaluar si un breach de datos personales exige notificación a la Agencia y a los titulares. Objetivo: evaluación dentro de **72 horas** desde el conocimiento confirmado. Usar asesoramiento legal; no inventar texto normativo en la UI.

Contenido sugerido: naturaleza del incidente, categorías de datos, volumen aproximado, medidas tomadas, contacto.

Referencia: [AAIP](https://www.argentina.gob.ar/aaip).

## 5. Plantilla de post-mortem

| Campo | Contenido |
|-------|-----------|
| Título / ID | |
| Severidad | Crítico / Alto / Medio / Bajo |
| Cronología | Detección → contención → erradicación → recuperación |
| Causa raíz | |
| Impacto | Tenants, usuarios, categorías de datos |
| Qué funcionó | |
| Qué mejorar | |
| Acciones correctivas | Responsable, fecha |
| Enlaces | Export de auditoría, PRs, tickets |

## Referencias

- Issue #222
- [SEC-008 Gestión de incidentes](../certificacion-iso/sec/sec-008-gestion-incidentes.md)
- [Seguridad](../seguridad.md)
- OpenAPI: `docs/api/openapi.yaml`
