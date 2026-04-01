# Convenção de documentos controlados (pacote ISO)

**Documento:** META-CONVENTION-001  
**Versão:** 1.0  
**Data:** 2026-04-01  

Este documento define a **nomenclatura e o layout** dos stubs de documentos controlados em `docs/{en,es,pt-br}/certificacion-iso/` e `docs/{en,es,pt-br}/processes/`.

## Layout de pastas (exemplo na árvore em inglês)

| Prefixo da família | Subpasta sob `certificacion-iso/` |
|---------------------|-------------------------------------|
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
| PROC-MAN-* | `../processes/` |

Índice dos manuais de processo: `processes/indice.md` (por idioma).

## Padrão de nome de arquivo

- **Inglês:** `kebab-case.md`; incluir prefixo de código quando útil.
- **Espanhol / português:** mesmo prefixo de código + **slug descritivo localizado** (ver [DOCUMENT_LOCALE_MAP.md](../../DOCUMENT_LOCALE_MAP.md)).

## Metadados obrigatórios (cada stub)

- **Código do documento**, **Versão**, **Data**, **Autor**
- **Nível de requisito**
- **Aplicabilidade normativa**
- **Estado de evidência**
- **Declaração fora do escopo** quando aplicável
- **Corpo canônico** (links quando a narrativa estiver em outro artefato)
- **Histórico de revisões** (somente acrescentar linhas)

## Histórico de revisões

| Versão | Data | Autor | Resumo das alterações |
|--------|------|-------|------------------------|
| 1.0 | 2026-04-01 | BizCode | Convenção inicial |

**Outros idiomas:** [English](../../en/certificacion-iso/controlled-document-convention.md) · [Español](../../es/certificacion-iso/convencion-documentos-controlados.md)
