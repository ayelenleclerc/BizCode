# Controlled document convention (ISO package)

**Document:** META-CONVENTION-001  
**Version:** 1.0  
**Date:** 2026-04-01  

This note defines how **controlled document stubs** are named and laid out under `docs/{en,es,pt-br}/certificacion-iso/` and `docs/{en,es,pt-br}/processes/`.

## Folder layout (English tree example)

| Family prefix | Subfolder under `certificacion-iso/` |
|---------------|--------------------------------------|
| GOV-* | `gov/` |
| RSK-* | `rsk/` |
| SEC-* | `sec/` |
| QLT-* | `qlt/` |
| REQ-* | `req/` |
| TST-* | `tst/` |
| ARC-* | `arc/` |
| SRV-* | `srv/` |
| HR-* | `hr/` |
| PRV-* | `prv/` |
| AI-* | `ai/` |
| PROC-MAN-* | `../processes/` (sibling of `certificacion-iso/`) |

Process manuals index: `processes/index.md` (per locale).

## Filename pattern

- **English:** `kebab-case.md`; include document code prefix where useful (e.g. `gov-001-scope-of-management-system.md`).
- **Spanish / Portuguese:** same code prefix + **localized descriptive slug** (see [DOCUMENT_LOCALE_MAP.md](../../DOCUMENT_LOCALE_MAP.md)).

## Required metadata block (each stub)

Every controlled stub includes:

- **Document code**, **Version**, **Date**, **Author**
- **Requirement level** (Mandatory / Highly recommended / As applicable / Highly expected)
- **Normative applicability** (ISO 9001:2015, ISO/IEC 27001:2022, … as applicable)
- **Evidence status** (Not evidenced / Partial / Evidenced — with links when partial)
- **Out-of-scope statement** when the product does not evidence the scope
- **Canonical body** links when narrative lives elsewhere (specs, quality, OpenAPI) — **single source of truth**
- **Revision history** table (append-only; add rows; do not delete prior rows)

## Revision history

| Version | Date | Author | Summary of changes |
|---------|------|--------|-------------------|
| 1.0 | 2026-04-01 | BizCode | Initial convention |

**Other languages:** [Español](../../es/certificacion-iso/convencion-documentos-controlados.md) · [Português](../../pt-br/certificacion-iso/convencao-documentos-controlados.md)
