# Statement of applicability (SoA)

| Document code | SEC-002 |
| Version | 0.2 |
| Date | 2026-08-25 |
| Author | BizCode |
| Requirement level | Mandatory |
| Normative applicability | ISO/IEC 27001:2022 |
| Evidence status | Partial — initial SoA linked to Annex A gap (#196) |

## Out-of-scope statement

This SoA supports **ISO-ready** preparation for BizCode. It does **not** claim ISO/IEC 27001 certification.

## Purpose

Declare which Annex A controls are applicable to the BizCode product ISMS scope, point to the gap analysis, and record high-level exclusions.

## Canonical gap analysis

Full control-by-control status: [ISO/IEC 27001:2022 Annex A gap analysis](../../quality/iso27001-annex-a-gap-analysis.md).

## ISMS scope

| In scope | Out of scope (current) |
|----------|------------------------|
| BizCode software (API, web, desktop sidecar, documented mobile apps) | Operator-owned physical facilities (Annex A.7) |
| Engineering controls in this repository and GitHub Actions | Corporate HR employment processes (most of A.6) |
| Documented security/privacy/backup/incident procedures under `docs/` | External certification Stage 1/2 |

## Applicability summary

| Theme | Applicable? | Notes |
|-------|-------------|--------|
| A.5 Organizational | Mostly yes | Many Partial / Not evidenced — see gap |
| A.6 People | Limited | Awareness/reporting Partial; screening/employment N/A |
| A.7 Physical | No (N/A) | Hosting/office physical = provider/operator |
| A.8 Technological | Yes | Strongest product evidence; BC/redundancy gaps → #197 |

## Exclusions (justified)

1. **A.7.1–A.7.14** — BizCode does not operate dedicated secure facilities in-repo; physical controls belong to hosting providers and customer premises.
2. **A.6.1, A.6.2, A.6.4, A.6.6** — Employment law / HR processes are organizational, outside the product repository.
3. **A.8.23 Web filtering** — Not a BizCode product control.

## Related controlled documents

- [SEC-001 Information security policy](sec-001-information-security-policy.md)
- [RSK-002 Risk register](../rsk/rsk-002-risk-register.md)
- [RSK-004 Risk treatment plan](../rsk/rsk-004-risk-treatment-plan.md)

## Revision history

| Version | Date | Author | Summary of changes |
|--------------|-----------|-------------|----------------|
| 0.1 | 2026-04-01 | BizCode | Initial stub |
| 0.2 | 2026-08-25 | BizCode | Initial SoA for #196; link Annex A gap |
