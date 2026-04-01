# Requisitos não funcionais (MVP)

| Campo | Valor |
|-------|--------|
| Versão do documento | 0.1 |
| Revisão | 1 |
| Data | 2026-03-31 |
| Referência ao produto | BizCode 0.1.0 MVP |

| ID | Requisito | Evidência |
|----|-----------|-----------|
| RNF-001 | **Acessibilidade:** WCAG 2.2 **AA**; `jsx-a11y` (zero avisos) + jest-axe smoke. | [acessibilidade.md](../acessibilidade.md), `App.a11y.test.tsx` |
| RNF-002 | **i18n:** três locales; CI com `check:i18n`. | [estrategia-i18n.md](../estrategia-i18n.md) |
| RNF-003 | **Segurança (desktop):** API em loopback; ameaças documentadas. | [seguranca.md](../seguranca.md) |
| RNF-004 | **Privacidade:** mapa de dados. | [mapa-dados-pessoais.md](../mapa-dados-pessoais.md) |
| RNF-005 | **Testes:** cobertura no escopo acordado; contrato OpenAPI. | [estrategia-testes.md](../quality/estrategia-testes.md), `vitest.config.ts`, `tests/api/contract.test.ts` |
| RNF-006 | **Código:** TypeScript estrito; `.cursor/rules/`. | [padroes-codigo.md](../padroes-codigo.md), [ADR-0003](../adr/ADR-0003-api-contract-testing.md) |

**Outros idiomas:** [English](../../en/specs/non-functional-requirements.md) · [Español](../../es/specs/non-functional-requirements.md)
