# Manual da qualidade

**Documento:** QM-001 · **Versão:** 1.0 · **Data:** 2026-03-31 · **Norma:** ISO 9001:2015

## Escopo

Aplica-se ao desenvolvimento e manutenção do **BizCode** (gestão comercial desktop). Abrange requisitos, design, implementação, testes e documentação.

## Política

Confiável, utilizável e auditável. Testes automatizados com limiares; CI multi-etapa; documentação em `docs/en/`, `docs/es/`, `docs/pt-br/`; acessibilidade WCAG 2.2 AA; i18n em 3 locales.

## Papéis

Desenvolvedor, revisor, pipeline CI, product owner — conforme tabela na versão em inglês.

## Documentos controlados

Documentação em três árvores com **nomes localizados** (ver [DOCUMENT_LOCALE_MAP.md](../../DOCUMENT_LOCALE_MAP.md)); histórico em git. Inclui [ciclo-vida-e-validacao-documental.md](ciclo-vida-e-validacao-documental.md) (SemVer, changelogs, validação).

## Não conformidade

Detectar → conter → analisar → corrigir → prevenir → registrar (ver RECORDS_TEMPLATE).

## Melhoria contínua

Issues `quality`; relatório de cobertura revisado por release.

**Outros idiomas:** [English](../../en/quality/quality-manual.md) · [Español](../../es/quality/manual-calidad.md)
