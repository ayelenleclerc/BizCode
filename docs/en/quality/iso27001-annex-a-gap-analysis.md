# ISO/IEC 27001:2022 Annex A — initial gap analysis (#196)

**Document role:** Canonical gap analysis for BizCode ISMS preparation (ISO-ready).  
**Normative reference:** ISO/IEC 27001:2022 Annex A (93 controls).  
**Evidence rule:** Status is based only on repository evidence (code, CI, docs). No certification claim.

| Field | Value |
|-------|--------|
| Related issue | [#196](https://github.com/ayelenleclerc/BizCode/issues/196) |
| SoA stub | [SEC-002](../certificacion-iso/sec/sec-002-statement-of-applicability-soa.md) |
| Risk register | [RSK-002](../certificacion-iso/rsk/rsk-002-risk-register.md) |
| Treatment plan | [RSK-004](../certificacion-iso/rsk/rsk-004-risk-treatment-plan.md) |
| Analysis date | 2026-08-25 |

## Status legend

| Status | Meaning |
|--------|---------|
| Implemented | Control intent is met with verifiable repo evidence for the product scope |
| Partial | Some evidence exists; gaps remain (often org/ops or pending issues) |
| Not evidenced | No adequate evidence in the repository |
| N/A | Outside current ISMS product scope (justified); operator facility or pure HR process |

## ISMS scope (product)

In scope for this gap:

- BizCode application (web, API, desktop sidecar, mobile apps documented in-repo)
- Engineering controls in GitHub CI and in-repo scripts
- Documented operational procedures that exist under `docs/`

Out of scope / operator-owned until evidenced:

- Physical office/datacenter controls (A.7) except where product docs apply
- Formal HR screening / employment contracts (A.6) beyond repo awareness stubs
- External certification Stage 1/2 and external pentest report archive ([#194](https://github.com/ayelenleclerc/BizCode/issues/194))
- Contractual SLA / DR drill evidence ([#197](https://github.com/ayelenleclerc/BizCode/issues/197))

## Summary counts (initial)

| Status | Approx. count |
|--------|----------------|
| Implemented | 0 |
| Partial | 53 |
| Not evidenced | 26 |
| N/A | 14 |
| **Total** | **93** |

Counts are indicative of this initial pass (conservative: product evidence is mostly **Partial** until org/ops records catch up). Re-count after remediation.

---

## A.5 Organizational controls

| Control | Title (short) | Status | Evidence / gap |
|---------|---------------|--------|----------------|
| A.5.1 | Policies for information security | Partial | [security.md](../security.md) threat/OWASP; ISMS policy section added under #196. Formal org approval = PR merge by product owner |
| A.5.2 | Information security roles and responsibilities | Partial | SuperAdmin / RBAC roles in [rbac-matrix](rbac-matrix-roles-permissions-scopes.md), [iam-model](iam-model-sessions-audit.md); org RACI still light |
| A.5.3 | Segregation of duties | Partial | RBAC permission separation; SuperAdmin vs tenant roles. No formal SoD matrix beyond RBAC |
| A.5.4 | Management responsibilities | Not evidenced | No board/management ISMS commitment record in repo |
| A.5.5 | Contact with authorities | Not evidenced | No authority contact register |
| A.5.6 | Contact with special interest groups | Not evidenced | No ISAC/community register |
| A.5.7 | Threat intelligence | Partial | Lightweight STRIDE + OWASP in [security.md](../security.md); no continuous TI feed |
| A.5.8 | Information security in project management | Partial | DoR/DoD in [master-plan](master-plan-bizcode-execution.md); security reviews ad hoc |
| A.5.9 | Inventory of information and other associated assets | Partial | [privacy-data-map.md](../privacy-data-map.md); SEC-003 still stub |
| A.5.10 | Acceptable use of information and other associated assets | Not evidenced | No acceptable-use policy in repo |
| A.5.11 | Return of assets | N/A | Physical/corporate asset return not in product repo |
| A.5.12 | Classification of information | Partial | Privacy classes in privacy docs; no full classification scheme |
| A.5.13 | Labelling of information | Not evidenced | No labelling scheme evidenced |
| A.5.14 | Information transfer | Partial | TLS/HTTPS expectations; WhatsApp/share links documented where used; no org transfer policy |
| A.5.15 | Access control | Partial | [SEC-004](../certificacion-iso/sec/sec-004-access-control-policy.md) stub → RBAC + `requirePermission` in `apps/server` |
| A.5.16 | Identity management | Partial | `AppUser` / sessions in [iam-model](iam-model-sessions-audit.md) |
| A.5.17 | Authentication information | Partial | Password hashing, bootstrap/seed env secrets ([security.md](../security.md)) |
| A.5.18 | Access rights | Partial | User management + RBAC; privileged access register SEC-006 stub |
| A.5.19 | Information security in supplier relationships | Partial | [SEC-013](../certificacion-iso/sec/sec-013-supplier-security-assessment-register.md) template; no engagement rows |
| A.5.20 | Addressing information security within supplier agreements | Not evidenced | No supplier contract security clauses archived in repo |
| A.5.21 | Managing information security in the ICT supply chain | Partial | Dependency gates: `pnpm audit`, Snyk ([dependency-scanning](dependency-scanning-and-triage.md)) |
| A.5.22 | Monitoring, review and change management of supplier services | Not evidenced | No supplier review cadence evidenced |
| A.5.23 | Information security for use of cloud services | Partial | Deploy/env docs ([deployment-environments](deployment-environments.md)); Doppler/secrets (#216); Cloudflare (#217) |
| A.5.24 | Information security incident management planning | Partial | [incident-response.md](incident-response.md), SEC-008 |
| A.5.25 | Assessment and decision on information security events | Partial | Security events / monitoring (#221) [security-monitoring.md](security-monitoring.md) |
| A.5.26 | Response to information security incidents | Partial | Runbooks in incident-response; SEC-009 register stub |
| A.5.27 | Learning from information security incidents | Partial | Post-mortem section in incident-response; no filled lessons register |
| A.5.28 | Collection of evidence | Partial | Audit events + forensic listing noted in incident-response / IAM audit |
| A.5.29 | Information security during disruption | Not evidenced | Points to [#197](https://github.com/ayelenleclerc/BizCode/issues/197) / SEC-014 stub |
| A.5.30 | ICT readiness for business continuity | Not evidenced | [#197](https://github.com/ayelenleclerc/BizCode/issues/197); SEC-014/015 stubs |
| A.5.31 | Legal, statutory, regulatory and contractual requirements | Partial | Privacy Ley 25326/GDPR (#195); fiscal modularity ADR-0007; not a full legal register |
| A.5.32 | Intellectual property rights | Not evidenced | No IP policy in repo |
| A.5.33 | Protection of records | Partial | Audit events, ISO records templates; retention incomplete |
| A.5.34 | Privacy and protection of PII | Partial | [privacy-and-data-subject-rights.md](privacy-and-data-subject-rights.md), PRV stubs |
| A.5.35 | Independent review of information security | Not evidenced | External pentest report empty ([pentest-report-register](../../evidence/pentest-report-register.md)); #194 open |
| A.5.36 | Compliance with policies, rules and standards | Partial | CI Quality Gate, docs map checks, lint/tests |
| A.5.37 | Documented operating procedures | Partial | Backup, deploy, CI/CD, incident runbooks; uneven coverage |

## A.6 People controls

| Control | Title (short) | Status | Evidence / gap |
|---------|---------------|--------|----------------|
| A.6.1 | Screening | N/A | Corporate HR; not evidenced in product repo |
| A.6.2 | Terms and conditions of employment | N/A | Corporate HR |
| A.6.3 | Information security awareness, education and training | Not evidenced | HR awareness stubs empty |
| A.6.4 | Disciplinary process | N/A | Corporate HR |
| A.6.5 | Responsibilities after termination or change of employment | Partial | Session revoke / user disable capabilities documented for operators; no HR offboarding SOP |
| A.6.6 | Confidentiality or non-disclosure agreements | N/A | Corporate legal |
| A.6.7 | Remote working | Not evidenced | No remote-work security policy in repo |
| A.6.8 | Information security event reporting | Partial | Monitoring + incident response paths for platform operators |

## A.7 Physical controls

All A.7 controls are **N/A** under current SaaS/desktop product scope (hosting/office physical security is operator/provider-owned; customer endpoints are covered under A.8.1 / mobile hardening where documented). Revisit if BizCode operates owned facilities.

| Control | Title (short) | Status | Evidence / gap |
|---------|---------------|--------|----------------|
| A.7.1 | Physical security perimeters | N/A | Operator/provider-owned |
| A.7.2 | Physical entry | N/A | Operator/provider-owned |
| A.7.3 | Securing offices, rooms and facilities | N/A | Operator/provider-owned |
| A.7.4 | Physical security monitoring | N/A | Operator/provider-owned |
| A.7.5 | Protecting against physical and environmental threats | N/A | Operator/provider-owned |
| A.7.6 | Working in secure areas | N/A | Operator/provider-owned |
| A.7.7 | Clear desk and clear screen | N/A | Corporate / endpoint operator policy |
| A.7.8 | Equipment siting and protection | N/A | Operator/provider-owned |
| A.7.9 | Security of assets off-premises | N/A | Corporate / customer devices |
| A.7.10 | Storage media | N/A | Operator/provider-owned (except encrypted backup artifacts — see A.8.13) |
| A.7.11 | Supporting utilities | N/A | Operator/provider-owned |
| A.7.12 | Cabling security | N/A | Operator/provider-owned |
| A.7.13 | Equipment maintenance | N/A | Operator/provider-owned |
| A.7.14 | Secure disposal or re-use of equipment | N/A | Operator/provider-owned |

## A.8 Technological controls

| Control | Title (short) | Status | Evidence / gap |
|---------|---------------|--------|----------------|
| A.8.1 | User endpoint devices | Partial | Mobile hardening (#220); Tauri allowlist; customer endpoint config operator-owned |
| A.8.2 | Privileged access rights | Partial | SuperAdmin bootstrap; SEC-006 stub |
| A.8.3 | Information access restriction | Partial | `requirePermission`, tenant scoping; IDOR remains pentest focus (#194) |
| A.8.4 | Access to source code | Partial | GitHub permissions (org); not documented as control in-repo |
| A.8.5 | Secure authentication | Partial | Session cookie auth, password hashing ([iam-model](iam-model-sessions-audit.md)) |
| A.8.6 | Capacity management | Not evidenced | No capacity plan in repo |
| A.8.7 | Protection against malware | Not evidenced | Endpoint AV is operator/customer-owned |
| A.8.8 | Management of technical vulnerabilities | Partial | [SEC-010](../certificacion-iso/sec/sec-010-vulnerability-patch-management-procedure.md), audit/Snyk/ZAP; external report pending |
| A.8.9 | Configuration management | Partial | Env examples, Docker/compose, deploy workflows |
| A.8.10 | Information deletion | Partial | Privacy/data subject rights; full erasure workflows partial |
| A.8.11 | Data masking | Not evidenced | No systematic masking framework evidenced |
| A.8.12 | Data leakage prevention | Partial | Log redaction ([log-sanitization-policy](log-sanitization-policy.md)), `check:logs` |
| A.8.13 | Information backup | Partial | [backup-and-restore.md](backup-and-restore.md), SEC-007 |
| A.8.14 | Redundancy of information processing facilities | Not evidenced | [#197](https://github.com/ayelenleclerc/BizCode/issues/197) |
| A.8.15 | Logging | Partial | Observability + security events (#221); pino redaction |
| A.8.16 | Monitoring activities | Partial | [security-monitoring.md](security-monitoring.md), [observability.md](observability.md) |
| A.8.17 | Clock synchronization | Not evidenced | Relies on host/container NTP; not documented |
| A.8.18 | Use of privileged utility programs | Not evidenced | No privileged-utility control doc |
| A.8.19 | Installation of software on operational systems | Partial | Container images via CI/GHCR; host package policy not evidenced |
| A.8.20 | Networks security | Partial | Helmet/CORS; Cloudflare WAF docs (#217); Docker networking |
| A.8.21 | Security of network services | Partial | TLS expectations for hosted; loopback desktop |
| A.8.22 | Segregation of networks | Partial | Staging vs production environments (#152) |
| A.8.23 | Web filtering | N/A | Not a product control |
| A.8.24 | Use of cryptography | Partial | HTTPS/TLS; encrypted backups; provider token encryption where implemented; SEC-012 stub |
| A.8.25 | Secure development life cycle | Partial | Tests, lint, type-check, contract tests, PR to `develop` |
| A.8.26 | Application security requirements | Partial | OpenAPI contract, a11y, security headers |
| A.8.27 | Secure system architecture and engineering principles | Partial | ADR-0007 modularity; multi-tenant design docs |
| A.8.28 | Secure coding | Partial | TypeScript strict, ESLint, `check:raw-sql`, no `any` policy |
| A.8.29 | Security testing in development and acceptance | Partial | Unit/API/E2E; ZAP baseline; external pentest pending (#194) |
| A.8.30 | Outsourced development | Not evidenced | No outsourced-dev security procedure |
| A.8.31 | Separation of development, test and production environments | Partial | [deployment-environments.md](deployment-environments.md), staging/prod workflows |
| A.8.32 | Change management | Partial | GitHub PR + CI; CONTRIBUTING |
| A.8.33 | Test information | Partial | Fixtures/seeds; caution on production-like data in staging seed docs |
| A.8.34 | Protection of information systems during audit testing | Partial | ZAP against ephemeral/staging targets; production customer data excluded by policy in pentest docs |

---

## Priority gap themes (feed RSK-004)

1. External independent security review (#194 report empty).
2. Formal ISMS policy approval + roles RACI (this issue / org).
3. Business continuity / DR drill and SLA (#197).
4. Asset inventory + classification beyond privacy map (SEC-003).
5. Supplier agreement security clauses + filled SEC-013 rows.
6. Security awareness training records (HR).
7. Capacity / redundancy / clock sync documentation for hosted ops.

## Related languages

- Español: [analisis-brechas-anexo-a-iso27001.md](../../es/quality/analisis-brechas-anexo-a-iso27001.md)
- Português: [analise-lacunas-anexo-a-iso27001.md](../../pt-br/quality/analise-lacunas-anexo-a-iso27001.md)

## Revision history

| Version | Date | Author | Summary |
|---------|------|--------|---------|
| 0.1 | 2026-08-25 | BizCode | Initial Annex A gap for #196 |
