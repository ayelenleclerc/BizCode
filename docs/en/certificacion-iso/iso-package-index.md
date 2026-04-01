# ISO certification package — master register

**Document:** ISO-PKG-001  
**Version:** 1.1  
**Date:** 2026-04-01  

This register is the **single master index** for ISO-oriented controlled documents under `docs/en/certificacion-iso/`, `docs/es/certificacion-iso/`, and `docs/pt-br/certificacion-iso/` (plus `docs/*/processes/`). It does not duplicate bodies of text; paths below are the **canonical** locations. **Not a claim of ISO certification** (ISO-ready).

**Entry point (repository root):** [Certificación-ISO/README.md](../../../Certificación-ISO/README.md)

**Supporting registers:** [document-register-traceability.md](document-register-traceability.md) (code → indicative clauses) · [traceability-between-documents.md](traceability-between-documents.md) · [controlled-document-convention.md](controlled-document-convention.md)

**Process manuals index:** [../processes/index.md](../processes/index.md)

## Requirement level legend (stubs)

| Key | Meaning |
|-----|---------|
| M | Mandatory |
| HR | Highly recommended |
| SA | As applicable |
| HE | Highly expected |

## Legacy / anchor documents (pre-stub catalogue)

| Code | Logical document | Canonical path (en) | Notes |
|------|------------------|----------------------|--------|
| ISO-PKG-001 | This master register | [iso-package-index.md](iso-package-index.md) | Trilingual |
| QM-001 | Quality manual | [quality-manual.md](quality-manual.md) | ISO 9001:2015 scope |
| QMS-TR-001 | ISO traceability matrix (norm → evidence) | [iso-traceability.md](iso-traceability.md) | Maps artefacts to clauses |
| DOC-CTL-001 | Document lifecycle & validation | [document-lifecycle-and-validation.md](document-lifecycle-and-validation.md) | SemVer, changelogs |
| REC-TPL-001 | Records templates | [records-template.md](records-template.md) | Nonconformity, test session |
| QMS-DR-001 | Document register — normative cross-reference | [document-register-traceability.md](document-register-traceability.md) | Indicative clauses |
| QMS-D2D-001 | Traceability between documents | [traceability-between-documents.md](traceability-between-documents.md) | Document graph |
| META-CONVENTION-001 | Controlled document convention | [controlled-document-convention.md](controlled-document-convention.md) | Naming and metadata |
| PROD-VISION-001 | Product vision — desktop, SaaS, fiscal modularity | [product-vision-and-deployment.md](../quality/product-vision-and-deployment.md) | [ADR-0007](../adr/ADR-0007-dual-deployment-and-fiscal-modularity.md) |

## Controlled document stubs (closed catalog — 108 codes)

## GOV — Governance

| Code | Document (en) | Requirement level |
|------|-----------------|---------------------|
| GOV-001 | [Scope of management system](gov/gov-001-scope-of-management-system.md) | M |
| GOV-002 | [Management system policy](gov/gov-002-management-system-policy.md) | M |
| GOV-003 | [Objectives and KPIs](gov/gov-003-objectives-and-kpis.md) | M |
| GOV-004 | [Process map](gov/gov-004-process-map.md) | HR |
| GOV-005 | [Interested parties and requirements matrix](gov/gov-005-interested-parties-requirements-matrix.md) | M |
| GOV-006 | [Roles and responsibilities (RACI)](gov/gov-006-raci-matrix.md) | HR |
| GOV-007 | [Document and record control procedure](gov/gov-007-document-record-control-procedure.md) | M |
| GOV-008 | [Change management procedure](gov/gov-008-change-management-procedure.md) | HR |
| GOV-009 | [Internal audit procedure](gov/gov-009-internal-audit-procedure.md) | M |
| GOV-010 | [Management review minutes template](gov/gov-010-management-review-minutes-template.md) | M |
| GOV-011 | [Nonconformity and corrective action procedure](gov/gov-011-nonconformity-corrective-action-procedure.md) | M |
| GOV-012 | [Continuous improvement register](gov/gov-012-continuous-improvement-register.md) | HR |

## RSK — Risk

| Code | Document (en) | Requirement level |
|------|-----------------|---------------------|
| RSK-001 | [Risk management methodology](rsk/rsk-001-risk-management-methodology.md) | M |
| RSK-002 | [Risk register](rsk/rsk-002-risk-register.md) | M |
| RSK-003 | [Risk assessment report](rsk/rsk-003-risk-assessment-report.md) | M |
| RSK-004 | [Risk treatment plan](rsk/rsk-004-risk-treatment-plan.md) | M |
| RSK-005 | [Opportunity register](rsk/rsk-005-opportunity-register.md) | HR |
| RSK-006 | [Accepted risks register](rsk/rsk-006-accepted-risks-register.md) | HR |

## SEC — Information security

| Code | Document (en) | Requirement level |
|------|-----------------|---------------------|
| SEC-001 | [Information security policy](sec/sec-001-information-security-policy.md) | M |
| SEC-002 | [Statement of applicability (SoA)](sec/sec-002-statement-of-applicability-soa.md) | M |
| SEC-003 | [Information asset inventory](sec/sec-003-information-asset-inventory.md) | M |
| SEC-004 | [Access control policy](sec/sec-004-access-control-policy.md) | HR |
| SEC-005 | [User access management procedure](sec/sec-005-user-access-management-procedure.md) | HR |
| SEC-006 | [Privileged access register](sec/sec-006-privileged-access-register.md) | HR |
| SEC-007 | [Backup and restore procedure](sec/sec-007-backup-and-restore-procedure.md) | HR |
| SEC-008 | [Incident management procedure](sec/sec-008-incident-management-procedure.md) | HR |
| SEC-009 | [Security incident register](sec/sec-009-security-incident-register.md) | HR |
| SEC-010 | [Vulnerability and patch management procedure](sec/sec-010-vulnerability-patch-management-procedure.md) | HR |
| SEC-011 | [Log monitoring and alerting procedure](sec/sec-011-log-monitoring-alerting-procedure.md) | HR |
| SEC-012 | [Cryptography policy](sec/sec-012-cryptography-policy.md) | SA |
| SEC-013 | [Supplier security assessment register](sec/sec-013-supplier-security-assessment-register.md) | HR |
| SEC-014 | [Business continuity and recovery plan](sec/sec-014-business-continuity-recovery-plan.md) | SA |
| SEC-015 | [Restore test evidence register](sec/sec-015-restore-test-evidence-register.md) | HR |

## QLT — Quality / SDLC

| Code | Document (en) | Requirement level |
|------|-----------------|---------------------|
| QLT-001 | [Software development lifecycle procedure](qlt/qlt-001-software-development-lifecycle-procedure.md) | HR |
| QLT-002 | [Requirements management procedure](qlt/qlt-002-requirements-management-procedure.md) | HR |
| QLT-003 | [Design and development procedure](qlt/qlt-003-design-and-development-procedure.md) | HR |
| QLT-004 | [Configuration and version control procedure](qlt/qlt-004-configuration-version-control-procedure.md) | HR |
| QLT-005 | [Release and deployment procedure](qlt/qlt-005-release-and-deployment-procedure.md) | HR |
| QLT-006 | [Production change log](qlt/qlt-006-production-change-log.md) | HR |
| QLT-007 | [Defect management procedure](qlt/qlt-007-defect-management-procedure.md) | HR |
| QLT-008 | [Quality metrics dashboard](qlt/qlt-008-quality-metrics-dashboard.md) | HR |
| QLT-009 | [Supplier evaluation procedure](qlt/qlt-009-supplier-evaluation-procedure.md) | SA |
| QLT-010 | [Approved suppliers list](qlt/qlt-010-approved-suppliers-list.md) | SA |

## REQ — Requirements

| Code | Document (en) | Requirement level |
|------|-----------------|---------------------|
| REQ-001 | [Business requirements document (BRD)](req/req-001-business-requirements-document-brd.md) | HR |
| REQ-002 | [Software requirements specification (SRS)](req/req-002-software-requirements-specification-srs.md) | HR |
| REQ-003 | [Functional requirements specification (FRS)](req/req-003-functional-requirements-specification-frs.md) | HR |
| REQ-004 | [Non-functional requirements specification (NFR)](req/req-004-non-functional-requirements-specification-nfr.md) | HR |
| REQ-005 | [Use cases and user stories](req/req-005-use-cases-and-user-stories.md) | HR |
| REQ-006 | [Acceptance criteria catalog](req/req-006-acceptance-criteria-catalog.md) | HR |
| REQ-007 | [Requirements traceability matrix (RTM)](req/req-007-requirements-traceability-matrix-rtm.md) | HR |
| REQ-008 | [Requirements change register](req/req-008-requirements-change-register.md) | HR |

## TST — Testing

| Code | Document (en) | Requirement level |
|------|-----------------|---------------------|
| TST-001 | [Test policy / test strategy](tst/tst-001-test-policy-strategy.md) | HR |
| TST-002 | [Master test plan](tst/tst-002-master-test-plan.md) | HR |
| TST-003 | [Test cases catalog](tst/tst-003-test-cases-catalog.md) | HR |
| TST-004 | [Test data management procedure](tst/tst-004-test-data-management-procedure.md) | HR |
| TST-005 | [Test execution evidence](tst/tst-005-test-execution-evidence.md) | HR |
| TST-006 | [Defect log](tst/tst-006-defect-log.md) | HR |
| TST-007 | [Regression test report](tst/tst-007-regression-test-report.md) | HR |
| TST-008 | [User acceptance test record (UAT)](tst/tst-008-user-acceptance-test-record.md) | HR |
| TST-009 | [Entry and exit criteria](tst/tst-009-entry-exit-criteria.md) | HR |
| TST-010 | [Test summary report](tst/tst-010-test-summary-report.md) | HR |

## ARC — Architecture / operations

| Code | Document (en) | Requirement level |
|------|-----------------|---------------------|
| ARC-001 | [Architecture overview](arc/arc-001-architecture-overview.md) | HR |
| ARC-002 | [Application and integration diagrams](arc/arc-002-application-integration-diagrams.md) | HR |
| ARC-003 | [Environment inventory](arc/arc-003-environment-inventory.md) | HR |
| ARC-004 | [API specification (OpenAPI)](arc/arc-004-api-specification-openapi.md) | SA |
| ARC-005 | [Operational runbooks](arc/arc-005-operational-runbooks.md) | HR |
| ARC-006 | [Monitoring and observability procedure](arc/arc-006-monitoring-observability-procedure.md) | HR |
| ARC-007 | [Release rollback plan](arc/arc-007-release-rollback-plan.md) | HR |
| ARC-008 | [Problem records](arc/arc-008-problem-records.md) | SA |

## SRV — Service management

| Code | Document (en) | Requirement level |
|------|-----------------|---------------------|
| SRV-001 | [Service management plan](srv/srv-001-service-management-plan.md) | HE |
| SRV-002 | [Service catalog](srv/srv-002-service-catalog.md) | HR |
| SRV-003 | [SLA catalog](srv/srv-003-sla-catalog.md) | HR |
| SRV-004 | [Incident management procedure](srv/srv-004-incident-management-procedure.md) | HR |
| SRV-005 | [Service request procedure](srv/srv-005-service-request-procedure.md) | HR |
| SRV-006 | [Problem management procedure](srv/srv-006-problem-management-procedure.md) | HR |
| SRV-007 | [Service continuity procedure](srv/srv-007-service-continuity-procedure.md) | HR |
| SRV-008 | [Capacity and availability management](srv/srv-008-capacity-availability-management.md) | HR |
| SRV-009 | [Service reporting KPIs](srv/srv-009-service-reporting-kpis.md) | HR |
| SRV-010 | [Operations records](srv/srv-010-operations-records.md) | HR |

## HR — People

| Code | Document (en) | Requirement level |
|------|-----------------|---------------------|
| HR-001 | [Competence matrix](hr/hr-001-competence-matrix.md) | HE |
| HR-002 | [Training plan](hr/hr-002-training-plan.md) | HR |
| HR-003 | [Training records](hr/hr-003-training-records.md) | HR |
| HR-004 | [Job descriptions](hr/hr-004-job-descriptions.md) | HR |
| HR-005 | [Security awareness program](hr/hr-005-security-awareness-program.md) | HR |
| HR-006 | [Onboarding and offboarding checklist](hr/hr-006-onboarding-offboarding-checklist.md) | HR |

## PRV — Privacy

| Code | Document (en) | Requirement level |
|------|-----------------|---------------------|
| PRV-001 | [Privacy policy](prv/prv-001-privacy-policy.md) | SA |
| PRV-002 | [PII processing inventory](prv/prv-002-pii-processing-inventory.md) | SA |
| PRV-003 | [Data retention and deletion procedure](prv/prv-003-data-retention-deletion-procedure.md) | SA |
| PRV-004 | [Data subject rights procedure](prv/prv-004-data-subject-rights-procedure.md) | SA |
| PRV-005 | [Privacy incident register](prv/prv-005-privacy-incident-register.md) | SA |

## AI — Artificial intelligence

| Code | Document (en) | Requirement level |
|------|-----------------|---------------------|
| AI-001 | [AI management system scope](ai/ai-001-ai-management-system-scope.md) | M |
| AI-002 | [Responsible AI policy](ai/ai-002-responsible-ai-policy.md) | HR |
| AI-003 | [AI system inventory](ai/ai-003-ai-system-inventory.md) | HR |
| AI-004 | [AI risk and impact assessment](ai/ai-004-ai-risk-impact-assessment.md) | HR |
| AI-005 | [Human oversight and approval model](ai/ai-005-human-oversight-approval-model.md) | HR |
| AI-006 | [AI data governance procedure](ai/ai-006-ai-data-governance-procedure.md) | HR |
| AI-007 | [AI incident register](ai/ai-007-ai-incident-register.md) | HR |
| AI-008 | [AI model lifecycle control](ai/ai-008-ai-model-lifecycle-control.md) | HR |

## PROC-MAN — Process manuals

| Code | Document (en) | Requirement level |
|------|-----------------|---------------------|
| PROC-MAN-001 | [Process: requirements and analysis](../processes/proc-man-001-requirements-and-analysis-process.md) | HR |
| PROC-MAN-002 | [Process: design and development](../processes/proc-man-002-design-and-development-process.md) | HR |
| PROC-MAN-003 | [Process: build, integration and CI](../processes/proc-man-003-build-integration-ci-process.md) | HR |
| PROC-MAN-004 | [Process: test and quality gates](../processes/proc-man-004-test-and-quality-gates-process.md) | HR |
| PROC-MAN-005 | [Process: release and deployment](../processes/proc-man-005-release-and-deployment-process.md) | HR |
| PROC-MAN-006 | [Process: information security in development](../processes/proc-man-006-security-in-development-process.md) | HR |
| PROC-MAN-007 | [Process: service and support](../processes/proc-man-007-service-and-support-process.md) | HR |
| PROC-MAN-008 | [Process: supplier and third-party management](../processes/proc-man-008-supplier-third-party-process.md) | HR |
| PROC-MAN-009 | [Process: document and record control](../processes/proc-man-009-document-record-control-process.md) | HR |
| PROC-MAN-010 | [Process: continuity and recovery](../processes/proc-man-010-continuity-and-recovery-process.md) | HR |

## Linked operational quality (not duplicated)

| Area | English path |
|------|----------------|
| Testing strategy | [../quality/testing-strategy.md](../quality/testing-strategy.md) |
| CI/CD | [../quality/ci-cd.md](../quality/ci-cd.md) |
| Swagger / OpenAPI UI plan | [../quality/swagger-openapi-ui-plan.md](../quality/swagger-openapi-ui-plan.md) |

## Product specifications and API

| Artefact | Path |
|----------|------|
| OpenAPI contract | [../../api/openapi.yaml](../../api/openapi.yaml) |
| Specs index | [../specs/index.md](../specs/index.md) |

## Supply chain evidence (SBOM)

| Code | Artefact | How to produce |
|------|----------|----------------|
| SBOM-001 | CycloneDX JSON (runtime-oriented npm tree; **devDependencies omitted**) | `npm run sbom:generate` → [`docs/evidence/sbom-cyclonedx.json`](../../evidence/sbom-cyclonedx.json). For a BOM that includes devDependencies: `npm run sbom:generate:full` → `docs/evidence/sbom-cyclonedx-full.json` (large; consider `.gitignore` if not needed in git). Regenerate after dependency changes. Not a substitute for organizational ISMS records. |

See [`docs/evidence/README.md`](../../evidence/README.md).

**Other languages:** [Español](../../es/certificacion-iso/indice-paquete-iso.md) · [Português](../../pt-br/certificacion-iso/indice-pacote-iso.md)
