# Referencias — sistema legado (Programa Suarez / Programa_Viejo)

**Alcance:** material de trabajo **interno** en **español** para relevamiento del programa DOS/Clipper y tablas `.DBF`. **No** es documentación oficial de BizCode, **no** forma parte del flujo trilingüe (`docs/en/`, `docs/es/`, `docs/pt-br/`) ni del mapa `DOCUMENT_LOCALE_MAP.md`.

**Regla:** las afirmaciones sobre el legado deben citar **evidencia** (ruta de archivo, salida de script, muestra de registro). Lo no observable en archivos va a [`11-preguntas-abiertas-stakeholders.md`](11-preguntas-abiertas-stakeholders.md).

## Índice de documentos

| Doc | Contenido |
|-----|-----------|
| [00-glosario-y-convenciones.md](00-glosario-y-convenciones.md) | Términos técnicos y convenciones |
| [01-inventario-fisico-layout.md](01-inventario-fisico-layout.md) | Layout de carpetas del snapshot |
| [02-inventario-dbf-indice-maestro.md](02-inventario-dbf-indice-maestro.md) | Índice de todos los `.DBF` (metadatos) |
| [03-diccionario-datos-por-dbf.md](03-diccionario-datos-por-dbf.md) | Diccionario de campos por tabla |
| [04-relaciones-evidenciadas-en-archivos.md](04-relaciones-evidenciadas-en-archivos.md) | Relaciones sustentadas en datos/índices |
| [05-mapeo-tablas-legacy-a-bizcode.md](05-mapeo-tablas-legacy-a-bizcode.md) | Matriz legacy → Prisma / API |
| [06-modulos-funcionales-legacy.md](06-modulos-funcionales-legacy.md) | Agrupación por módulos (criterio explícito) |
| [07-mapa-modulos-interconexion-y-estrategia.md](07-mapa-modulos-interconexion-y-estrategia.md) | Mapa, interconexión y estrategia BizCode |
| [07b-patrones-cruces-tablas-desde-muestras.md](07b-patrones-cruces-tablas-desde-muestras.md) | Opcional: cruces tabulares de muestras |
| [08-componentes-runtime-no-datos.md](08-componentes-runtime-no-datos.md) | EXE, BAT, PIF, impresión DOS |
| [09-limitaciones-riesgos-migracion.md](09-limitaciones-riesgos-migracion.md) | Riesgos técnicos del legado |
| [10-plan-implementaciones-futuras-bizcode.md](10-plan-implementaciones-futuras-bizcode.md) | Backlog alineado al mapa |
| [11-preguntas-abiertas-stakeholders.md](11-preguntas-abiertas-stakeholders.md) | Vacíos de conocimiento |
| [12-trazabilidad-scripts-herramientas.md](12-trazabilidad-scripts-herramientas.md) | Scripts y reproducción |

## Volcados reproducibles

| Carpeta | Contenido |
|---------|-----------|
| [exports/README.md](exports/README.md) | Volcado completo `inventario-dbf-volcado.md` (107 `.DBF`) |

## Carpeta de trabajo por bloques

| Carpeta | Uso |
|---------|-----|
| [bloques/README.md](bloques/README.md) | Estado por grupo A–F y archivos revisados |

## Rutas del legado

- Variable de entorno: `PROGRAMA_VIEJO_ROOT` — raíz de la copia (absoluta o relativa al cwd de `npm`). Ver [`.env.example`](../../.env.example).
- Estructura esperada por los scripts: `{root}/16-07-2025 completa/sistema/` (también puede existir anidación `…/16-07-2025 completa/16-07-2025 completa/` en algunas copias; ajustar `PROGRAMA_VIEJO_ROOT` al segmento **inmediatamente superior** a `16-07-2025 completa`).
- Ejemplo de copia de trabajo: `E:\Z- programa Suarez\16-07-2025 completa\16-07-2025 completa\` → definir `PROGRAMA_VIEJO_ROOT` en consecuencia.

## Estado global del relevamiento

| Fase | Estado |
|------|--------|
| Inventario automático `.DBF` | Ver `npm run inspect:dbf-all` en [12-trazabilidad-scripts-herramientas.md](12-trazabilidad-scripts-herramientas.md) |
| Diccionario por archivo | Volcado global en [`exports/inventario-dbf-volcado.md`](exports/inventario-dbf-volcado.md); fichas puntuales en `bloques/` |
| Mapa y estrategia (`07`) | Actualizado con inventario 107 tablas (2026-04-04) |

**Última actualización:** inventario DBF completo y volcado bajo `exports/`.
