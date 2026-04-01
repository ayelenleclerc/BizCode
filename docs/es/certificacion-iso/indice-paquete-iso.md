# Paquete ISO — registro maestro

**Documento:** ISO-PKG-001  
**Versión:** 1.0  
**Fecha:** 2026-04-01  

Este registro es el **índice maestro único** de la documentación orientada a ISO bajo `docs/en/certificacion-iso/`, `docs/es/certificacion-iso/` y `docs/pt-br/certificacion-iso/`. No duplica el contenido; las rutas siguientes son las ubicaciones **canónicas**.

**Punto de entrada (raíz del repositorio):** [Certificación-ISO/README.md](../../../Certificación-ISO/README.md)

| Código | Documento lógico | Ruta canónica (es) | Notas |
|--------|------------------|---------------------|--------|
| ISO-PKG-001 | Este registro maestro | [indice-paquete-iso.md](indice-paquete-iso.md) | Trilingüe; mismas decisiones en cada idioma |
| QM-001 | Manual de calidad | [manual-calidad.md](manual-calidad.md) | Alcance ISO 9001:2015 |
| QMS-TR-001 | Matriz de trazabilidad ISO (norma → evidencia) | [trazabilidad-iso.md](trazabilidad-iso.md) | Mapea artefactos a cláusulas |
| DOC-CTL-001 | Ciclo de vida y validación documental | [ciclo-vida-y-validacion-documental.md](ciclo-vida-y-validacion-documental.md) | SemVer, historiales, lista de comprobación |
| REC-TPL-001 | Plantillas de registros | [plantillas-registros.md](plantillas-registros.md) | No conformidad, sesión de prueba |

## Calidad operativa enlazada (no duplicada)

Permanece bajo `docs/*/quality/` y lo citan el manual y la matriz de trazabilidad:

| Área | Ruta (es) |
|------|-----------|
| Estrategia de pruebas | [../quality/estrategia-pruebas.md](../quality/estrategia-pruebas.md) |
| CI/CD | [../quality/ciclo-ci-cd.md](../quality/ciclo-ci-cd.md) |
| Plan Swagger / OpenAPI UI | [../quality/plan-swagger-openapi-ui.md](../quality/plan-swagger-openapi-ui.md) |

## Especificaciones de producto y API

| Artefacto | Ruta |
|-----------|------|
| Contrato OpenAPI | [../../api/openapi.yaml](../../api/openapi.yaml) |
| Índice de especificaciones | [../specs/indice.md](../specs/indice.md) |

## Evidencia de cadena de suministro (SBOM)

| Código | Artefacto | Cómo generarlo |
|--------|-----------|----------------|
| SBOM-001 | JSON CycloneDX (árbol npm orientado a runtime; **sin devDependencies**) | `npm run sbom:generate` → [`docs/evidence/sbom-cyclonedx.json`](../../evidence/sbom-cyclonedx.json). BOM con devDependencies: `npm run sbom:generate:full` → `docs/evidence/sbom-cyclonedx-full.json` (voluminoso). Regenerar tras cambios de dependencias. No sustituye registros organizacionales del SGSI. |

Ver [`docs/evidence/README.md`](../../evidence/README.md).

### Familias de códigos previstas (incremental)

Al aprobar nuevo Markdown controlado, añadir fila aquí y en los otros idiomas, y registrar el documento lógico en [DOCUMENT_LOCALE_MAP.md](../../DOCUMENT_LOCALE_MAP.md).

| Prefijo | Uso típico (orientativo) |
|---------|---------------------------|
| GOV-* | Gobierno: alcance, políticas, objetivos, mapa de procesos, partes interesadas, RACI, auditorías, revisión por la dirección |
| RSK-* | Riesgos: metodología, registro, tratamiento, oportunidades |
| SEC-* | Seguridad de la información (cuando aplique alcance SGSI) |

**Otros idiomas:** [English](../../en/certificacion-iso/iso-package-index.md) · [Português](../../pt-br/certificacion-iso/indice-pacote-iso.md)
