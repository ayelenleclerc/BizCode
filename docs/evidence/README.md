# Repository evidence (SBOM)

This folder holds **machine-generated** evidence used for supply-chain traceability.

| Output | Command | Format |
|--------|---------|--------|
| [sbom-cyclonedx.json](sbom-cyclonedx.json) | `npm run sbom:generate` | CycloneDX JSON (`@cyclonedx/cyclonedx-npm`), **devDependencies omitted** (runtime-oriented) |
| `sbom-cyclonedx-full.json` (optional) | `npm run sbom:generate:full` | Full tree including devDependencies (large; not committed by default — add to `.gitignore` if used) |

Regenerate after `package.json` / lockfile changes, or run **`npm run docs:generate`** (includes `sbom:generate` with the other generated docs). The file is **not** a substitute for organizational records (ISMS, QMS); it complements them with an npm dependency inventory.

**Related:** [ISO certification package index (en)](../en/certificacion-iso/iso-package-index.md) — SBOM-001.

---

## Evidencia del repositorio (SBOM)

Esta carpeta contiene evidencia **generada automáticamente** para trazabilidad de la cadena de suministro.

| Salida | Comando | Formato |
|--------|---------|---------|
| [sbom-cyclonedx.json](sbom-cyclonedx.json) | `npm run sbom:generate` | JSON CycloneDX (`@cyclonedx/cyclonedx-npm`), **sin devDependencies** (orientado a runtime) |
| `sbom-cyclonedx-full.json` (opcional) | `npm run sbom:generate:full` | Árbol completo con devDependencies (voluminoso) |

Regenerar tras cambios en `package.json` o el lockfile, o ejecutar **`npm run docs:generate`** (incluye `sbom:generate` con el resto de documentación generada). El archivo **no** sustituye registros organizacionales (SGSI, SGC); complementa el inventario de dependencias npm.

**Relacionado:** [Índice del paquete ISO (es)](../es/certificacion-iso/indice-paquete-iso.md) — SBOM-001.

---

## Evidência do repositório (SBOM)

Esta pasta contém evidência **gerada automaticamente** para rastreabilidade da cadeia de suprimentos.

| Saída | Comando | Formato |
|-------|---------|---------|
| [sbom-cyclonedx.json](sbom-cyclonedx.json) | `npm run sbom:generate` | JSON CycloneDX (`@cyclonedx/cyclonedx-npm`), **sem devDependencies** (orientado a runtime) |
| `sbom-cyclonedx-full.json` (opcional) | `npm run sbom:generate:full` | Árvore completa com devDependencies (grande) |

Regenerar após alterações em `package.json` ou no lockfile, ou executar **`npm run docs:generate`** (inclui `sbom:generate` com a demais documentação gerada). O arquivo **não** substitui registros organizacionais (SGSI, SGQ); complementa o inventário de dependências npm.

**Relacionado:** [Índice do pacote ISO (pt-BR)](../pt-br/certificacion-iso/indice-pacote-iso.md) — SBOM-001.
