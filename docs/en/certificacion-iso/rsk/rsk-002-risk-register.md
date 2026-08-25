# Risk register

| Document code | RSK-002 |
| Version | 0.2 |
| Date | 2026-08-25 |
| Author | BizCode |
| Requirement level | Mandatory |
| Normative applicability | ISO 9001:2015; ISO/IEC 27001:2022; ISO/IEC 20000-1:2018; ISO/IEC 42001:2023 |
| Evidence status | Partial — initial critical risks for #196 (≥10) |

## Out-of-scope statement

ISO-ready risk register for the BizCode product ISMS scope. Does not claim certification.

## Purpose

Record the most critical information-security risks identified from the Annex A gap and existing product threat model.

## Scale

| Score | Likelihood | Impact |
|-------|------------|--------|
| L / M / H | Low / Medium / High | Low / Medium / High |

## Register (≥10 critical risks)

| ID | Risk | L | I | Owner | Related Annex A / control | Evidence / notes |
|----|------|---|---|-------|---------------------------|------------------|
| R-01 | Cross-tenant IDOR / broken access control | M | H | Engineering | A.8.3, A.5.15 | RBAC partial; external pentest focus [#194](https://github.com/ayelenleclerc/BizCode/issues/194) |
| R-02 | Secrets or tokens leaked in logs / CI artifacts | M | H | Engineering | A.8.12, A.8.15 | Log redaction + `check:logs`; operator sink review still required |
| R-03 | Unpatched High+ dependency vulnerability | M | H | Engineering | A.8.8, A.5.21 | `pnpm audit` + Snyk; triage guide #219 |
| R-04 | Missing external independent security review before commercial launch | H | H | Product owner | A.5.35, A.8.29 | Pentest register empty; #194 open |
| R-05 | Backup restore failure or untested DR | M | H | Platform ops | A.8.13, A.5.30 | Scripts #150; **local smoke** in SEC-015 (2026-08-25); staging drill still pending [#197](https://github.com/ayelenleclerc/BizCode/issues/197) |
| R-06 | Staging/production config confusion (wrong DB / secrets) | M | H | Platform ops | A.8.31, A.8.9 | Env separation docs #152; human error residual |
| R-07 | Compromised SuperAdmin / bootstrap credentials | L | H | Product owner | A.8.2, A.5.17 | Env-only passwords; rotation discipline operator-owned |
| R-08 | Incomplete privacy / data-subject fulfilment | M | M | Product owner | A.5.34 | #195 docs; operational fulfilment maturity varies |
| R-09 | Supply-chain compromise (npm package / CI action) | M | H | Engineering | A.5.21 | Lockfile + audit gates; no full SBOM process ownership beyond generated SBOM |
| R-10 | SaaS/hosted exposure without TLS or WAF misconfig | M | H | Platform ops | A.8.20, A.5.23 | Helmet/CORS in app; Cloudflare docs #217; operator must enable |
| R-11 | Business continuity gap (no SLA / unproven RTO) | H | H | Product owner | A.5.29, A.5.30 | SLA/DR docs shipped (#197); **public uptime + staging RTO** still open |
| R-12 | Insufficient security awareness for operators | M | M | Product owner | A.6.3 | No training records in repo |

Treatment actions: [RSK-004](rsk-004-risk-treatment-plan.md). Gap context: [Annex A gap](../../quality/iso27001-annex-a-gap-analysis.md).

## Revision history

| Version | Date | Author | Summary of changes |
|--------------|-----------|-------------|----------------|
| 0.1 | 2026-04-01 | BizCode | Initial stub |
| 0.2 | 2026-08-25 | BizCode | Initial ≥12 risks for #196 |
