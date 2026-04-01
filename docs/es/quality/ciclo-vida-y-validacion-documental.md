# Ciclo de vida documental y validación

Este documento controlado enlaza **control documental**, **versionado SemVer**, **historiales de cambios** y expectativas de **validación / verificación** para el conjunto de documentación ISO-ready. No sustituye al [manual de calidad](manual-calidad.md); lo complementa.

## Identificación documental

- La documentación de producto y calidad está en `docs/en/`, `docs/es/` y `docs/pt-br/` con **nombres de archivo localizados**; la lista canónica es [DOCUMENT_LOCALE_MAP.md](../../DOCUMENT_LOCALE_MAP.md).
- **Git** es el historial de versiones autoritativo; la rama `main` es la referencia revisada.
- Los ADR usan el **mismo slug técnico** en cada locale bajo `docs/*/adr/`.

## SemVer e historial de cambios

- Los lanzamientos siguen [Semantic Versioning](https://semver.org/); la versión actual está en `package.json` en la raíz del repositorio.
- Los cambios visibles para el usuario se registran en **[Unreleased]** en cada changelog por idioma (véase [historial-de-cambios.md](../historial-de-cambios.md) y equivalentes en el mapa) antes de añadir una sección de versión.

## Lista de validación (antes del merge)

Si cambias documentación narrativa:

- [ ] El **mismo cambio lógico** está en los **tres** árboles de locale donde exista ese documento, salvo correcciones puntuales solo en stubs.
- [ ] Se actualiza [DOCUMENT_LOCALE_MAP.md](../../DOCUMENT_LOCALE_MAP.md) si cambia alguna **ruta**.
- [ ] `npm run check:docs-map` termina correctamente.
- [ ] Si cambia el comportamiento de la API HTTP: [docs/api/openapi.yaml](../../api/openapi.yaml) y pruebas de contrato (véase [ADR-0003](../../adr/ADR-0003-api-contract-testing.md)).

## Verificación

- **Automatizada:** CI ejecuta type-check, lint, pruebas, umbrales de cobertura, paridad i18n y comprobación del mapa documental.
- **Humana:** revisión por pares; el texto debe coincidir con **evidencia** en el repositorio (sin especular).

**Relacionado:** [trazabilidad-iso.md](trazabilidad-iso.md) · [plantillas-registros.md](plantillas-registros.md)

**Otros idiomas:** [English](../../en/quality/document-lifecycle-and-validation.md) · [Português](../../pt-br/quality/ciclo-vida-e-validacao-documental.md)
