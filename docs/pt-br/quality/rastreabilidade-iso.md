# Matriz de rastreabilidade ISO

Mapa dos artefactos de qualidade do BizCode para cláusulas ISO. Documentação Markdown em **três idiomas** (`docs/en/`, `docs/es/`, `docs/pt-br/`) com **nomes de arquivo localizados** por idioma. Ver [I18N_DOCUMENTATION.md](../../I18N_DOCUMENTATION.md) e [DOCUMENT_LOCALE_MAP.md](../../DOCUMENT_LOCALE_MAP.md).

| Artefacto | ISO 9001:2015 | ISO/IEC 12207 | ISO/IEC 27001 | ISO/IEC 25010 | ISO/IEC 29119 |
|---|---|---|---|---|---|
| TESTING_STRATEGY + Vitest | §8.7 | §6.4.9 | — | Confiabilidade | 29119-2, 29119-4 |
| ACCESSIBILITY + jsx-a11y | §8.1 | — | — | Usabilidade | — |
| I18N_STRATEGY + check-i18n | §8.1 | — | — | Portabilidade | — |
| SECURITY | §8.1 | §6.3.8 | A.8.x | Segurança | — |
| openapi.yaml + contract tests | §8.3 | §6.3.2 | — | Adequação funcional | 29119-2 |
| ADR-0003 (contrato API) | §8.3.3 | §6.3.6 | — | Manutenibilidade | — |
| CI_CD + workflow | §8.5 | §6.3.6 | A.8.25 | — | — |
| QUALITY_MANUAL | §4.4, §10.2 | §6.1 | — | — | — |
| ADR-0001, ADR-0002 | §8.3.3 | §6.3.2 | — | — | — |
| PRIVACY_DATA_MAP | §8.1 | — | A.5.x | — | — |
| Manuais do usuário | §7.5 | §6.4.12 | — | Usabilidade | — |
| THEMING | §8.3 | §6.4.12 | — | Usabilidade | — |
| CONTRIBUTING DoD | §8.5.1 | §6.3.6 | A.8.25 | — | 29119-2 §7 |
| RECORDS_TEMPLATE | §10.2.2 | §6.7.1 | A.5.33 | — | 29119-3 |
| GLOSSARY | §7.5 | §6.1.3 | — | — | — |
| Pasta **`specs/`** (README, manual técnico, RF/RNF, casos de uso, histórias, casos de teste manual, matriz de rastreabilidade) | §8.3 | §6.4.12 | — | Adequação funcional | 29119-3 (catálogo MVP de testes manuais) |

## Notas

- ISO 29119: partes 2 e 4 cobertas pela estratégia; parte 3 (documentação de testes) com suporte MVP em `docs/*/specs/manual-test-cases.md` e registros em `modelos-registros.md`.

**Outros idiomas:** [English](../../en/quality/iso-traceability.md) · [Español](../../es/quality/trazabilidad-iso.md)
