# Visión de producto: escritorio, SaaS y modularidad fiscal

**ID de evidencia:** PROD-VISION-001  
**ADR relacionado:** [ADR-0007](../adr/ADR-0007-dual-deployment-and-fiscal-modularity.md)

## Finalidad

Este documento fija la **dirección estratégica de producto y arquitectura** para que colaboradores y automatización (p. ej. agentes Cursor) alineen **un núcleo de producto** entregable como **escritorio** y, cuando se implemente, **SaaS**, con **normativa fiscal aislada por país o jurisdicción**. **No** sustituye asesoría legal o fiscal por mercado.

## Dos modos de entrega, un núcleo

- **Escritorio (actual):** Tauri, SPA React, API Express en sidecar, PostgreSQL — ver [arquitectura.md](../arquitectura.md).
- **SaaS (capacidad objetivo):** Mismo dominio de negocio como **cliente web + API alojada + base gestionada** (multi-tenant si aplica).
- **Intención:** Evitar dos bases de código divergentes. Compartir **lógica de dominio**, **modelo de datos** donde sea posible y **contrato API** ([OpenAPI](../../api/openapi.yaml)); variar **cómo se ejecuta** (binario local vs nube) con adaptadores y configuración.

**Canal vs jurisdicción:** «Escritorio vs nube» y «Argentina vs otros países» son **dimensiones independientes**. Prioridades comerciales válidas no deben codificarse como «solo X puede usar Y» sin decisión explícita aquí o en un ADR.

## Escritorio multiusuario

Los despliegues de escritorio pueden tener **varios usuarios** (p. ej. oficina/LAN). Usuario, rol y auditoría deben ser **conceptualmente compatibles** con un futuro SaaS (mismas entidades; distinto aislamiento y política de despliegue).

## Módulos fiscales por país

- La **variación normativa** (facturación electrónica, impuestos, conexiones a administraciones) se modela como **módulos o capas por país/jurisdicción**, activables por **configuración, licencia o tenant** — no como `if (país)` dispersos.
- Un solo producto puede ofrecer opciones fiscales **nacionales e internacionales** en **escritorio y SaaS**; cambia **qué módulos están habilitados**, no necesariamente un fork del repositorio.

**Fuera de alcance de los «módulos fiscales» por sí solos:** diseño multi-tenant, **facturación de suscripción del proveedor**, residencia de datos y obligaciones legales por mercado. Requieren diseño, documentación y ADRs aparte cuando se implementen.

## Principios de arquitectura

| Principio | Práctica |
|-----------|----------|
| **Monorepo** | Preferir **un repositorio**; evitar un segundo repo «clonado» permanente salvo razón fuerte. |
| **Núcleo + adaptadores** | Dominio y API estables; conectores fiscales y despliegue **enchufables**. |
| **Frontera API clara** | OpenAPI + pruebas de contrato como ancla; el SaaS debe **respetar o versionar** el contrato público. |
| **Entrega por fases** | Cerrar escritorio con límites claros; añadir despliegue alojado sin reescribir desde cero. |

## Contenedores opcionales

Un **Dockerfile** / **docker-compose** para **API + PostgreSQL** (y opcionalmente build web estático) puede ayudar al **desarrollo y despliegue del lado servidor**. **No** sustituye los builds nativos **Tauri** de escritorio. Al introducirlo, documentarlo en calidad/ops junto a [ciclo-ci-cd.md](ciclo-ci-cd.md).

## Gobernanza: mantener el foco

- Los **PR** que alteren dominio fiscal o supuestos de despliegue deben **citar** este documento o [ADR-0007](../adr/ADR-0007-dual-deployment-and-fiscal-modularity.md) si cambian la decisión.
- **Git / GitHub:** Flujo de ramas en [CONTRIBUTING.md](../../../CONTRIBUTING.md); remoto recomendado para backup y revisión.
- **Detalle legal/fiscal:** Decisiones de diseño aquí; **detalle normativo por país** en matrices o anexos bajo `docs/*/certificacion-iso/` cuando corresponda.
- **Operación SaaS:** Con despliegue en nube real, enlazar [seguridad.md](../seguridad.md) y [mapa-datos-personales.md](../mapa-datos-personales.md) en runbooks.

## Referencias

- [arquitectura.md](../arquitectura.md)
- [CONTRIBUTING.md](../../../CONTRIBUTING.md)
- [I18N_DOCUMENTATION.md](../../I18N_DOCUMENTATION.md) · [DOCUMENT_LOCALE_MAP.md](../../DOCUMENT_LOCALE_MAP.md)
