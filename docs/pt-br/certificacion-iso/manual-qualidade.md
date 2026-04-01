# Manual da qualidade

**Documento:** QM-001 · **Versão:** 1.0 · **Data:** 2026-03-31 · **Norma:** ISO 9001:2015

## Escopo

Aplica-se ao desenvolvimento e manutenção do **BizCode** (gestão comercial desktop). Abrange requisitos, design, implementação, testes e documentação.

## Política

Confiável, utilizável e auditável. Testes automatizados com limiares; CI multi-etapa; documentação em `docs/en/`, `docs/es/`, `docs/pt-br/`; acessibilidade WCAG 2.2 AA; i18n em 3 locales.

## Papéis

Desenvolvedor, revisor, pipeline CI, product owner — conforme tabela na versão em inglês.

## Documentos controlados

Documentação em três árvores com **nomes localizados** (ver [DOCUMENT_LOCALE_MAP.md](../../DOCUMENT_LOCALE_MAP.md)); histórico em git. Inclui [indice-pacote-iso.md](indice-pacote-iso.md) (ISO-PKG-001), [rastreabilidade-iso.md](rastreabilidade-iso.md), [modelos-registros.md](modelos-registros.md), [ciclo-vida-e-validacao-documental.md](ciclo-vida-e-validacao-documental.md) (SemVer, changelogs, validação); em `docs/*/quality/`: estratégia de testes, CI/CD, plano Swagger/OpenAPI; demais documentos em `docs/*/` conforme o manual em inglês.

## Não conformidade

Detectar → conter → analisar → corrigir → prevenir → registrar (ver [modelos-registros.md](modelos-registros.md)).

## Melhoria contínua

Issues `quality`; relatório de cobertura revisado por release.

**Outros idiomas:** [English](../../en/certificacion-iso/quality-manual.md) · [Español](../../es/certificacion-iso/manual-calidad.md)
