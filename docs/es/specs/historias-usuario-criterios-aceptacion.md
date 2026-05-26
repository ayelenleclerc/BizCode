# Historias de usuario y criterios de aceptación (MVP)

| Campo | Valor |
|-------|--------|
| Versión del documento | 0.2 |
| Revisión | 2 |
| Fecha | 2026-05-15 |
| Referencia al producto | BizCode 0.1.0 MVP |

Formato: los criterios **Given / When / Then** son de verificación **manual** salvo enlace a pruebas automatizadas existentes.

## HU-01 — ABM clientes

- **Historia:** Como operador quiero crear, buscar y editar clientes para mantener el maestro de clientes.
- **Criterios (Given/When/Then):**
  - Dado que estoy en la página Clientes, cuando busco por texto/código, entonces la lista se filtra según el comportamiento de la API.
  - Dado que guardo un cliente válido, cuando la API responde con éxito, entonces la lista refleja el cambio (o puedo reabrir el registro).
- **Evidencia:** `src/pages/clientes/`, `GET/POST/PUT /api/clientes`.

## HU-02 — ABM artículos

- **Historia:** Como operador quiero mantener artículos con rubro y condición IVA para usarlos en facturas.
- **Criterios:**
  - Dado que edito un artículo, cuando selecciono un rubro del desplegable, entonces proviene de los rubros devueltos por `GET /api/rubros`.
- **Evidencia:** `src/pages/articulos/`, `GET /api/articulos`, `GET /api/rubros`.

## HU-03 — Emisión de facturas

- **Historia:** Como operador quiero emitir facturas con ítems y totales para registrar ventas.
- **Criterios:**
  - Dado que creo una factura, cuando agrego al menos una línea y selecciono un cliente, entonces guardar se habilita según las reglas de la UI documentadas en el manual de usuario.
- **Evidencia:** `src/pages/facturacion/`, `GET/POST /api/facturas`, `GET /api/formas-pago`.

## HU-04 — Tema

- **Historia:** Como operador quiero cambiar entre tema claro/oscuro y conservar la elección en este equipo.
- **Criterios:**
  - Dado que cambio el tema, cuando recargo la aplicación, entonces el tema coincide con `localStorage` y el comportamiento de la clase en `<html>` según [temas-interfaz.md](../temas-interfaz.md).
- **Evidencia:** `Layout.tsx`, `index.html`.

## HU-05 — Idioma

- **Historia:** Como operador quiero usar la UI en español, inglés o portugués brasileño.
- **Criterios:**
  - Dado que cambio el idioma, cuando navego por los módulos, entonces no hay cadenas visibles al usuario fuera de `t()` (política).
- **Evidencia:** [estrategia-i18n.md](../estrategia-i18n.md).

## HU-06 — Cobros de clientes

- **Historia:** Como operador quiero registrar y listar cobros de clientes para seguir saldos y cobranzas.
- **Criterios:**
  - Dado que tengo `sales.create`, cuando guardo un cobro válido, entonces `POST /api/cobros` responde con éxito y la lista se actualiza.
  - Dado un cliente suspendido o inactivo, cuando registro un cobro, entonces la API devuelve 422 según OpenAPI.
- **Evidencia:** `src/pages/cobros/`, `tests/api/cobros.test.ts`.

## HU-07 — CxC y cuenta corriente

- **Historia:** Como usuario de finanzas quiero antigüedad de saldos y cuenta corriente por cliente para seguir la cartera.
- **Criterios:**
  - Dado `reports.financial.read`, cuando abro Finanzas, entonces los buckets de antigüedad cargan desde `GET /api/reportes/aging`.
  - Dado un id de cliente válido, cuando solicito la cuenta corriente, entonces las líneas muestran saldo acumulado desde `GET /api/reportes/cuenta-corriente/:clienteId`.
- **Evidencia:** `src/pages/finanzas/`.

## HU-08 — Reportes

- **Historia:** Como gerente quiero reportes de ventas, stock y cobranzas por período, con exportación CSV cuando corresponda.
- **Criterios:**
  - Dado permiso operativo, cuando abro la pestaña ventas o stock, entonces los datos cargan desde el endpoint `/api/reportes/*` correspondiente.
  - Dado permiso financiero, cuando exporto cobranzas con cabecera CSV, entonces la UI inicia la descarga del archivo.
- **Evidencia:** `src/pages/reportes/`.

## HU-09 — Órdenes de entrega

- **Historia:** Como personal de logística quiero planificar y actualizar órdenes de entrega por fecha y zona.
- **Criterios:**
  - Dado `logistics.read`, cuando filtro por fecha/estado, entonces el listado proviene de `GET /api/ordenes-entrega`.
  - Dado `orders.create`, cuando envío una orden nueva, entonces `POST /api/ordenes-entrega` crea el registro.
- **Evidencia:** `src/pages/logistica/`, `registerOrdenesEntregaRoutes.ts`.

## HU-10 — Picking en depósito

- **Historia:** Como personal de depósito quiero tomar órdenes de la cola y marcarlas listas para despacho.
- **Criterios:**
  - Dado `orders.pick` y `logistics.picking`, cuando completo el checklist, entonces el estado pasa a `ready`.
- **Evidencia:** `src/pages/logistica/picking/`, endpoints de picking en `registerOrdenesEntregaRoutes.ts`.

## HU-11 — Repartos

- **Historia:** Como planificador quiero agrupar OE listas en un reparto, iniciarlo y cerrarlo al finalizar.
- **Criterios:**
  - Dado `orders.dispatch` y `logistics.dispatches`, cuando creo e inicio un reparto, entonces queda `on_route` con OE vinculadas.
- **Evidencia:** `src/pages/logistica/repartos/`, `registerRepartosRoutes.ts`.

## HU-12 — Prueba de entrega (POD)

- **Historia:** Como chofer quiero confirmar cada parada con firma para dejar constancia.
- **Criterios:**
  - Dado `orders.deliver.confirm` y `logistics.pod`, cuando envío POD de un ítem, entonces queda `delivered` y el comprobante es consultable.
- **Evidencia:** `src/pages/logistica/repartos/chofer/`, `PUT .../items/{itemId}`, `GET .../pod`.

## HU-13 — Seguimiento GPS en vivo

- **Historia:** Como planificador quiero ver repartos activos en mapa; como chofer, enviar mi ubicación en ruta.
- **Criterios:**
  - Dado `logistics.gps`, cuando el reparto está `on_route`, entonces el mapa muestra la última posición y el chofer puede publicar ubicación periódicamente.
- **Evidencia:** `src/pages/logistica/seguimiento/`, `RepartoUbicacionService.ts`, `GET /api/repartos/activos`.

**Otros idiomas:** [English](../../en/specs/user-stories-and-acceptance.md) · [Português](../../pt-br/specs/historias-usuario-criterios-aceitacao.md)
