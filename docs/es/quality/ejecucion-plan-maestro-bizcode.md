# Plan maestro BizCode — índice de ejecución

Este documento es un **índice ejecutable** del plan maestro BizCode (horizonte ~180 días con **hitos a ~90 días**). No sustituye el archivo de plan en Cursor; enlaza evidencia del repositorio y el paquete trilingüe de calidad.

## Referencias

- Visión de producto (PROD-VISION-001): [vision-producto-y-despliegue.md](vision-producto-y-despliegue.md)
- Despliegue dual y modularidad fiscal: [ADR-0007](../adr/ADR-0007-dual-deployment-and-fiscal-modularity.md)
- Bootstrap SuperAdmin y RBAC (seed, env): [superadmin-bootstrap-y-rbac.md](superadmin-bootstrap-y-rbac.md)
- Plan Cursor → Issues GitHub / Project (`plan:sync`): [sincronizacion-plan-cursor-github.md](sincronizacion-plan-cursor-github.md)
- CI/CD: [ciclo-ci-cd.md](ciclo-ci-cd.md)
- Backlog técnico complementario (no sustituto de este índice): [10-plan-implementaciones-futuras-bizcode.md](../../referencias/10-plan-implementaciones-futuras-bizcode.md)

## Índice de fases (plan maestro)

| Fase | Ventana (indicativa) | Enfoque |
|------|----------------------|---------|
| **0** | Semanas 1–2 | Gobierno del proyecto, mapa documental, DoR/DoD, sin alcance sin backlog + criterio de aceptación |
| **1** | Semanas 3–6 | Base IAM: roles y permisos en código, sesiones, auditoría, autorización en rutas REST documentadas en OpenAPI |
| **2** | Semanas 7–10 | **Diseño** operativo mayorista/minorista: pedido → logística → entrega → cobranza (dominio `pedido` aún no obligatorio en Prisma) |
| **3** | Semanas 11–13 | Estabilidad, pruebas por criticidad, observabilidad mínima sobre eventos auditables, criterios de salida MVP para pilotos |

## Paquete de gobierno

### Definition of Ready (DoR)

- Ítem de backlog con criterio de aceptación **verificable** (comando de prueba, ruta de archivo, path OpenAPI o comportamiento documentado).
- Dependencias y alcance explícitos (sin acoplamiento oculto con módulos fiscales según ADR-0007).

### Definition of Done (DoD)

- Pasan los chequeos automáticos pertinentes (`npm run test`, `npm run lint`, `npm run type-check` según aplique).
- Si cambia comportamiento, API o UI: actualizar **tres locales** bajo `docs/` según [DOCUMENT_LOCALE_MAP.md](../../DOCUMENT_LOCALE_MAP.md) y OpenAPI si cambia el contrato HTTP.
- La documentación sigue siendo fiel al código (sin endpoints ni tablas inventadas).

### Regla de implementación

**Sin implementación** sin ítem de backlog ligado a un criterio de aceptación **verificable** y evidencia en el repo (pruebas, contrato o docs alineadas al código).

## Backlog P0 / P1 (~90 días)

Las prioridades siguientes son ítems de **planificación**; la verificación es contra el repositorio en el momento del merge.

| ID | Prioridad | Ítem | Criterio de aceptación verificable |
|----|-----------|------|--------------------------------------|
| BP0-1 | P0 | Paquete trilingüe de ejecución (este doc + matriz RBAC + IAM + diseño de flujo pedido) | Archivos bajo `docs/en|es|pt-br/quality/` según [DOCUMENT_LOCALE_MAP.md](../../DOCUMENT_LOCALE_MAP.md); `npm run check:docs-map` OK |
| BP0-2 | P0 | RBAC documentado como fuente de verdad | La matriz coincide con `ROLE_PERMISSIONS` en [`src/lib/rbac.ts`](../../../src/lib/rbac.ts) |
| BP0-3 | P0 | IAM y sesiones documentados | Describe `Tenant`, `AppUser`, `AppSession`, `AuditEvent` en [`prisma/schema.prisma`](../../../prisma/schema.prisma) y el flujo en [`server/auth.ts`](../../../server/auth.ts) |
| BP0-4 | P0 | Auth en API de dominio | Rutas bajo `/api/clientes`, `/api/articulos`, `/api/rubros`, `/api/facturas`, `/api/formas-pago` usan `requirePermission` en [`server/createApp.ts`](../../../server/createApp.ts); contrato en [`docs/api/openapi.yaml`](../../api/openapi.yaml) |
| BP1-1 | P1 | Dominio pedido (`pedido`) | **Futuro:** modelo Prisma + migración + rutas solo cuando consten en OpenAPI y en `server/` |
| BP1-2 | P1 | Cobertura E2E / integración de caminos críticos | Alineado con [estrategia-pruebas.md](estrategia-pruebas.md) y herramientas Playwright/Postgres existentes |
| BP1-3 | P1 | Refuerzo de alcance por canal | **Implementado en el código actual:** `requirePermission` en [`server/auth.ts`](../../../server/auth.ts) valida `x-bizcode-channel` opcional contra `AuthScope.channels`; cabecera inválida devuelve `400` y canal fuera de alcance devuelve `403`. Cubierto por [`tests/server/scope-channel.test.ts`](../../../tests/server/scope-channel.test.ts) |
| BP1-4 | P1 | Chat interno (alcance mínimo) | Implementado con `/api/chat/conversations`, `/api/chat/messages`, contador de no leídos vía `Notification` (`chat_message`), historial paginado y ruta UI `/chat` en `src/pages/chat/index.tsx` |
| BP1-5 | P1 | Preparación ETL clientes DBF (#51) | Relevamiento documentado en `scripts/MIGRACION_PROGRAMA_VIEJO.md` (mapeo explícito `COND`/`BAJA`/`CREDITO` y política de rechazo); sin implementación productiva de ETL de clientes en esta fase |

## Estado del repositorio vs este paquete

| Tema | Documento en español |
|------|----------------------|
| Matriz RBAC (roles → permisos, canales) | [matriz-rbac-roles-permisos-scopes.md](matriz-rbac-roles-permisos-scopes.md) |
| IAM (modelo de datos, sesiones, auditoría) | [modelo-iam-sesiones-auditoria.md](modelo-iam-sesiones-auditoria.md) |
| Flujo operativo pedido → entrega → cobranza (diseño) | [flujo-operativo-pedido-entrega-cobranza.md](flujo-operativo-pedido-entrega-cobranza.md) |

Los equivalentes en inglés y portugués aparecen en las mismas filas lógicas de [DOCUMENT_LOCALE_MAP.md](../../DOCUMENT_LOCALE_MAP.md).
