# Historias de usuario y criterios de aceptación (MVP)

| Campo | Valor |
|-------|--------|
| Versión del documento | 0.1 |
| Revisión | 1 |
| Fecha | 2026-03-31 |
| Referencia al producto | BizCode 0.1.0 MVP |

Los criterios **Given / When / Then** son de verificación **manual** salvo enlace a pruebas automatizadas existentes.

## HU-01 — ABM clientes

- **Historia:** Como operador quiero crear, buscar y editar clientes para mantener el maestro.
- **Criterios:** Dado que estoy en Clientes, cuando busco y guardo datos válidos, entonces el comportamiento coincide con la API y la UI documentada.
- **Evidencia:** `src/pages/clientes/`, `GET/POST/PUT /api/clientes`.

## HU-02 — ABM artículos

- **Historia:** Como operador quiero mantener artículos con rubro y condición IVA para usarlos en facturas.
- **Criterios:** Dado que edito un artículo, cuando elijo rubro, entonces proviene de `GET /api/rubros`.
- **Evidencia:** `src/pages/articulos/`.

## HU-03 — Emisión de facturas

- **Historia:** Como operador quiero emitir facturas con ítems y totales.
- **Criterios:** Dado una factura nueva, cuando faltan ítems o cliente, entonces guardar se comporta según manual de usuario.
- **Evidencia:** `src/pages/facturacion/`, `GET/POST /api/facturas`.

## HU-04 — Tema

- **Historia:** Como operador quiero cambiar tema y conservarlo en este equipo.
- **Criterios:** Dado que cambio el tema, al recargar coincide con `temas-interfaz.md`.
- **Evidencia:** `Layout.tsx`, `index.html`.

## HU-05 — Idioma

- **Historia:** Como operador quiero usar la UI en ES/EN/PT-BR.
- **Criterios:** Navegación sin literales fuera de `t()` (política).
- **Evidencia:** [estrategia-i18n.md](../estrategia-i18n.md).

**Otros idiomas:** [English](../../en/specs/user-stories-and-acceptance.md) · [Português](../../pt-br/specs/user-stories-and-acceptance.md)
