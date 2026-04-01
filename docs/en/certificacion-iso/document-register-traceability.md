# Document register — normative cross-reference (indicative)

**Document:** QMS-DR-001  
**Version:** 0.1  
**Date:** 2026-04-01  

This register links **controlled document codes** (GOV/RSK/…/PROC-MAN) to **indicative** standard clauses for audit preparation. It does **not** replace formal certification advice.

| Code | Indicative clauses (examples) | Notes |
|------|--------------------------------|-------|
| GOV-* | ISO 9001:2015 §4–§10 (context, leadership, planning, support, operation, performance, improvement) | See [iso-traceability.md](iso-traceability.md) for artefact mapping |
| RSK-* | ISO/IEC 27001:2022 §6.1.2; ISO 9001 §6.1; ISO/IEC 42001 risk themes | Populate treatment in RSK stubs |
| SEC-* | ISO/IEC 27001:2022 Annex A (as applicable) | ISMS scope may be limited for desktop product |
| QLT-* | ISO 9001 §8.3–§8.6; ISO/IEC 12207 (as referenced in repo) | Link to quality and CI evidence |
| REQ-* | ISO 9001 §8.3; ISO/IEC/IEEE 29148 | Canonical narrative in `docs/*/specs/` where linked |
| TST-* | ISO 9001 §8.7; ISO/IEC/IEEE 29119 | Canonical tests in `tests/`, strategy in `docs/*/quality/` |
| ARC-* | ISO 9001 §8.1; ISO/IEC 27001 operational controls | OpenAPI in `docs/api/openapi.yaml` |
| SRV-* | ISO/IEC 20000-1 (service management) | As applicable when operating a service |
| HR-* | ISO 9001 §7.1.2; ISO/IEC 27001 §7.2 | Competence and awareness |
| PRV-* | ISO/IEC 27701 (extension to 27001 for privacy) | Align with `privacy-data-map.md` |
| AI-* | ISO/IEC 42001 (AI management system) | As applicable when AI is in scope |
| PROC-MAN-* | Process view; align with GOV/QLT | See [../processes/index.md](../processes/index.md) |

## Revision history

| Version | Date | Author | Summary of changes |
|---------|------|--------|-------------------|
| 0.1 | 2026-04-01 | BizCode | Initial register |

**Other languages:** [Español](../../es/certificacion-iso/registro-trazabilidad-documentos-normas.md) · [Português](../../pt-br/certificacion-iso/registro-rastreabilidade-documentos-normas.md)
