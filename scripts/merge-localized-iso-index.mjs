import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.join(__dirname, '..')

const esHeader = `# Paquete ISO — registro maestro

**Documento:** ISO-PKG-001  
**Versión:** 1.1  
**Fecha:** 2026-04-01  

Índice maestro de documentación orientada a ISO bajo \`docs/en/certificacion-iso/\`, \`docs/es/certificacion-iso/\` y \`docs/pt-br/certificacion-iso/\` (y \`docs/*/processes/\`). **No implica certificación ISO** (ISO-ready).

**Punto de entrada (raíz del repositorio):** [Certificación-ISO/README.md](../../../Certificación-ISO/README.md)

**Registros de apoyo:** [registro-trazabilidad-documentos-normas.md](registro-trazabilidad-documentos-normas.md) · [trazabilidad-entre-documentos.md](trazabilidad-entre-documentos.md) · [convencion-documentos-controlados.md](convencion-documentos-controlados.md)

**Índice de manuales de proceso:** [../processes/indice.md](../processes/indice.md)

## Leyenda de niveles (stubs)

| Clave | Significado |
|-------|-------------|
| M | Obligatorio |
| HR | Muy recomendado |
| SA | Según alcance |
| HE | Muy esperado |

## Documentos ancla / legado (antes del catálogo de stubs)

| Código | Documento lógico | Ruta canónica (es) | Notas |
|--------|------------------|---------------------|--------|
| ISO-PKG-001 | Este registro maestro | [indice-paquete-iso.md](indice-paquete-iso.md) | Trilingüe |
| QM-001 | Manual de calidad | [manual-calidad.md](manual-calidad.md) | ISO 9001:2015 |
| QMS-TR-001 | Matriz de trazabilidad ISO | [trazabilidad-iso.md](trazabilidad-iso.md) | Norma → evidencia |
| DOC-CTL-001 | Ciclo de vida y validación documental | [ciclo-vida-y-validacion-documental.md](ciclo-vida-y-validacion-documental.md) | SemVer |
| REC-TPL-001 | Plantillas de registros | [plantillas-registros.md](plantillas-registros.md) | NC, pruebas |
| QMS-DR-001 | Registro documentos — referencia normativa | [registro-trazabilidad-documentos-normas.md](registro-trazabilidad-documentos-normas.md) | Indicativo |
| QMS-D2D-001 | Trazabilidad entre documentos | [trazabilidad-entre-documentos.md](trazabilidad-entre-documentos.md) | Grafo |
| META-CONVENTION-001 | Convención de documentos controlados | [convencion-documentos-controlados.md](convencion-documentos-controlados.md) | Metadatos |
| PROD-VISION-001 | Visión de producto | [vision-producto-y-despliegue.md](../quality/vision-producto-y-despliegue.md) | [ADR-0007](../adr/ADR-0007-dual-deployment-and-fiscal-modularity.md) |

## Catálogo cerrado de stubs (108 códigos)

`

const esFooter = `
## Calidad operativa enlazada (no duplicada)

| Área | Ruta (es) |
|------|-----------|
| Estrategia de pruebas | [../quality/estrategia-pruebas.md](../quality/estrategia-pruebas.md) |
| CI/CD | [../quality/ciclo-ci-cd.md](../quality/ciclo-ci-cd.md) |
| Plan Swagger / OpenAPI UI | [../quality/plan-swagger-openapi-ui.md](../quality/plan-swagger-openapi-ui.md) |

## Especificaciones y API

| Artefacto | Ruta |
|-----------|------|
| Contrato OpenAPI | [../../api/openapi.yaml](../../api/openapi.yaml) |
| Índice de especificaciones | [../specs/indice.md](../specs/indice.md) |

## Evidencia de cadena de suministro (SBOM)

| Código | Artefacto | Cómo generar |
|--------|-----------|--------------|
| SBOM-001 | CycloneDX JSON | \`npm run sbom:generate\` → [docs/evidence/sbom-cyclonedx.json](../../evidence/sbom-cyclonedx.json) |

Ver [docs/evidence/README.md](../../evidence/README.md).

**Otros idiomas:** [English](../../en/certificacion-iso/iso-package-index.md) · [Português](../../pt-br/certificacion-iso/indice-pacote-iso.md)
`

const ptHeader = `# Pacote ISO — registro mestre

**Documento:** ISO-PKG-001  
**Versão:** 1.1  
**Data:** 2026-04-01  

Registro mestre para documentação orientada a ISO em \`docs/en/certificacion-iso/\`, \`docs/es/certificacion-iso/\` e \`docs/pt-br/certificacion-iso/\` (e \`docs/*/processes/\`). **Não implica certificação ISO** (ISO-ready).

**Ponto de entrada (raiz do repositório):** [Certificación-ISO/README.md](../../../Certificación-ISO/README.md)

**Registros de apoio:** [registro-rastreabilidade-documentos-normas.md](registro-rastreabilidade-documentos-normas.md) · [rastreabilidade-entre-documentos.md](rastreabilidade-entre-documentos.md) · [convencao-documentos-controlados.md](convencao-documentos-controlados.md)

**Índice dos manuais de processo:** [../processes/indice.md](../processes/indice.md)

## Legenda de níveis (stubs)

| Chave | Significado |
|-------|-------------|
| M | Obrigatório |
| HR | Muito recomendado |
| SA | Conforme o escopo |
| HE | Muito esperado |

## Documentos âncora / legado (antes do catálogo de stubs)

| Código | Documento lógico | Caminho canônico (pt-BR) | Notas |
|--------|------------------|--------------------------|--------|
| ISO-PKG-001 | Este registro mestre | [indice-pacote-iso.md](indice-pacote-iso.md) | Trilíngue |
| QM-001 | Manual de qualidade | [manual-qualidade.md](manual-qualidade.md) | ISO 9001:2015 |
| QMS-TR-001 | Matriz de rastreabilidade ISO | [rastreabilidade-iso.md](rastreabilidade-iso.md) | Norma → evidência |
| DOC-CTL-001 | Ciclo de vida e validação documental | [ciclo-vida-e-validacao-documental.md](ciclo-vida-e-validacao-documental.md) | SemVer |
| REC-TPL-001 | Modelos de registros | [modelos-registros.md](modelos-registros.md) | NC, testes |
| QMS-DR-001 | Registro documentos — referência normativa | [registro-rastreabilidade-documentos-normas.md](registro-rastreabilidade-documentos-normas.md) | Indicativo |
| QMS-D2D-001 | Rastreabilidade entre documentos | [rastreabilidade-entre-documentos.md](rastreabilidade-entre-documentos.md) | Grafo |
| META-CONVENTION-001 | Convenção de documentos controlados | [convencao-documentos-controlados.md](convencao-documentos-controlados.md) | Metadados |
| PROD-VISION-001 | Visão do produto | [visao-produto-e-implantacao.md](../quality/visao-produto-e-implantacao.md) | [ADR-0007](../adr/ADR-0007-dual-deployment-and-fiscal-modularity.md) |

## Catálogo fechado de stubs (108 códigos)

`

const ptFooter = `
## Qualidade operacional (não duplicada)

| Área | Caminho (pt-BR) |
|------|-----------------|
| Estratégia de testes | [../quality/estrategia-testes.md](../quality/estrategia-testes.md) |
| CI/CD | [../quality/ciclo-ci-cd.md](../quality/ciclo-ci-cd.md) |
| Plano Swagger / OpenAPI UI | [../quality/plano-swagger-openapi-ui.md](../quality/plano-swagger-openapi-ui.md) |

## Especificações e API

| Artefato | Caminho |
|----------|---------|
| Contrato OpenAPI | [../../api/openapi.yaml](../../api/openapi.yaml) |
| Índice de especificações | [../specs/indice.md](../specs/indice.md) |

## Evidência de cadeia de suprimentos (SBOM)

| Código | Artefato | Como gerar |
|--------|----------|------------|
| SBOM-001 | CycloneDX JSON | \`npm run sbom:generate\` → [docs/evidence/sbom-cyclonedx.json](../../evidence/sbom-cyclonedx.json) |

Ver [docs/evidence/README.md](../../evidence/README.md).

**Outros idiomas:** [English](../../en/certificacion-iso/iso-package-index.md) · [Español](../../es/certificacion-iso/indice-paquete-iso.md)
`

const esTables = fs.readFileSync(path.join(ROOT, 'scripts', '_iso-pkg-tables-es.txt'), 'utf8')
const ptTables = fs.readFileSync(path.join(ROOT, 'scripts', '_iso-pkg-tables-pt.txt'), 'utf8')

fs.writeFileSync(path.join(ROOT, 'docs', 'es', 'certificacion-iso', 'indice-paquete-iso.md'), esHeader + esTables + esFooter)
fs.writeFileSync(path.join(ROOT, 'docs', 'pt-br', 'certificacion-iso', 'indice-pacote-iso.md'), ptHeader + ptTables + ptFooter)
console.log('Wrote localized ISO index files.')
