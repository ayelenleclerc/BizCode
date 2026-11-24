# ADR-0029: Topología de despliegue BizCode Local (baseline un sitio)

- **Estado:** Aceptado (baseline evidenciado); elección piloto multisitio **Pendiente decisión propietaria / Chris**
- **Fecha:** 2026-11-23
- **Issue:** [#537](https://github.com/ayelenleclerc/BizCode/issues/537)
- **Relacionado:** [ADR-0007](ADR-0007-dual-deployment-and-fiscal-modularity.md), [ADR-0010](ADR-0010-multi-tenant-isolation.md), [topologia-despliegue-local.md](../quality/topologia-despliegue-local.md) (#537), [matriz-alcance-local-distribuidora.md](../quality/matriz-alcance-local-distribuidora.md) (#536)

## Contexto

BizCode Local para distribuidora (#535) necesita topología explícita: un establecimiento con varios puestos, opción multi-sucursal (hasta cinco sitios) y relación de portal / seller / driver / e-commerce / webhooks con un API local. ADR-0007 ya elige **un monorepo** y modos **desktop + SaaS**. La visión de producto documenta multi-usuario en LAN. La arquitectura describe Express como **sidecar** Tauri; `src-tauri` hoy solo expone `ping` y **no** arranca el API ([#539](https://github.com/ayelenleclerc/BizCode/issues/539)).

Prisma modela **una** base PostgreSQL por despliegue (`DATABASE_URL`), con multi-depósito (`Deposito`, incl. `tipo = sucursal`) y aislamiento por tenant — **no** sync sitio-a-sitio. Los outbox offline móviles vacían hacia un API alcanzable; los webhooks de marketplace/pagos requieren `API_PUBLIC_URL` público.

## Decisión

1. **Baseline Local (un establecimiento):** Un host **principal** (o servidor LAN) ejecuta **Express API + PostgreSQL** para ese establecimiento; los puestos adicionales son **clientes** (navegador / ventana Tauri) contra ese API (`VITE_API_URL` / IP LAN). Ningún puesto crea por defecto una base independiente.
2. **Drift docs vs runtime:** “Express como sidecar Tauri” es la historia de empaquetado **objetivo**; hasta #539, la operación Local debe iniciar API (y Postgres) de forma explícita. No afirmar un sidecar implementado si no está evidenciado en `src-tauri`.
3. **Depósitos ≠ sitios:** `Deposito.tipo = sucursal` y `TransferenciaDeposito` (#236) son almacenes **en la misma DB**. No equivalen a cinco instalaciones Local independientes.
4. **Multisitio (hasta cinco locales):** Dos topologías candidatas quedan como **opciones para decisión de propietaria** (no implementadas aquí):
   - **A — Base compartida:** un PostgreSQL (+ API) alcanzable por enlace seguro desde todos los sitios.
   - **B — Bases locales + sync:** DB/API por sitio con un subsistema de sync futuro (**Not evidenced**; issues hijas tras la elección).
5. **Canales remotos:** Portal B2B (#240), Seller (#167+), Driver (#159+), sync e-commerce (#189) y webhooks entrantes permanecen en el inventario de regresión. En Local: exponer un edge controlado o mantener canales en ruta hosted; inbox público durable más allá de webhooks actuales está **fuera de alcance** de este ADR.
6. **No** inventar sync distribuida, elección de líder ni replicación multi-DB en código bajo este ADR.

## Consecuencias

- Positivo: modelo un-sitio claro y compatible con ADR-0007; modos de fallo y canales documentados; elección multisitio explícita y revisable.
- Negativo: el piloto de cinco sitios no puede declararse listo hasta elegir A o B e implementar empaquetado (#539), seguridad (#538) y sync si aplica.
- Seguimiento: #538 → #539 → #540; sync solo **después** de la decisión multisitio.

## Otros idiomas

Mismo slug: [English](../../en/adr/ADR-0029-local-deployment-topology.md) · [Português (Brasil)](../../pt-br/adr/ADR-0029-local-deployment-topology.md)
