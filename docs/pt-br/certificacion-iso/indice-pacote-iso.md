# Pacote ISO — registro mestre

**Documento:** ISO-PKG-001  
**Versão:** 1.0  
**Data:** 2026-04-01  

Este registro é o **índice mestre único** da documentação orientada a ISO em `docs/en/certificacion-iso/`, `docs/es/certificacion-iso/` e `docs/pt-br/certificacion-iso/`. Não duplica o conteúdo; as rotas abaixo são **canônicas**.

**Ponto de entrada (raiz do repositório):** [Certificación-ISO/README.md](../../../Certificación-ISO/README.md)

| Código | Documento lógico | Rota canônica (pt-BR) | Notas |
|--------|-------------------|------------------------|--------|
| ISO-PKG-001 | Este registro mestre | [indice-pacote-iso.md](indice-pacote-iso.md) | Trilíngue; mesmas decisões em cada idioma |
| QM-001 | Manual da qualidade | [manual-qualidade.md](manual-qualidade.md) | Escopo ISO 9001:2015 |
| QMS-TR-001 | Matriz de rastreabilidade ISO (norma → evidência) | [rastreabilidade-iso.md](rastreabilidade-iso.md) | Mapeia artefatos a cláusulas |
| DOC-CTL-001 | Ciclo de vida e validação documental | [ciclo-vida-e-validacao-documental.md](ciclo-vida-e-validacao-documental.md) | SemVer, changelogs, checklist |
| REC-TPL-001 | Modelos de registros | [modelos-registros.md](modelos-registros.md) | Não conformidade, sessão de teste |

## Qualidade operacional vinculada (não duplicada)

Permanece em `docs/*/quality/` e é referenciada pelo manual e pela matriz:

| Área | Rota (pt-BR) |
|------|----------------|
| Estratégia de testes | [../quality/estrategia-testes.md](../quality/estrategia-testes.md) |
| CI/CD | [../quality/ciclo-ci-cd.md](../quality/ciclo-ci-cd.md) |
| Plano Swagger / OpenAPI UI | [../quality/plano-swagger-openapi-ui.md](../quality/plano-swagger-openapi-ui.md) |

## Especificações de produto e API

| Artefato | Rota |
|----------|------|
| Contrato OpenAPI | [../../api/openapi.yaml](../../api/openapi.yaml) |
| Índice de especificações | [../specs/indice.md](../specs/indice.md) |

## Evidência da cadeia de suprimentos (SBOM)

| Código | Artefato | Como gerar |
|--------|----------|------------|
| SBOM-001 | JSON CycloneDX (árvore npm orientada a runtime; **sem devDependencies**) | `npm run sbom:generate` → [`docs/evidence/sbom-cyclonedx.json`](../../evidence/sbom-cyclonedx.json). BOM com devDependencies: `npm run sbom:generate:full` → `docs/evidence/sbom-cyclonedx-full.json` (grande). Regenerar após mudanças de dependências. Não substitui registros organizacionais do SGSI. |

Ver [`docs/evidence/README.md`](../../evidence/README.md).

### Famílias de códigos previstas (incremental)

Ao aprovar novo Markdown controlado, acrescentar linha aqui e nos outros idiomas, e registrar o documento lógico em [DOCUMENT_LOCALE_MAP.md](../../DOCUMENT_LOCALE_MAP.md).

| Prefixo | Uso típico (orientativo) |
|---------|---------------------------|
| GOV-* | Governança: escopo, políticas, objetivos, mapa de processos, partes interessadas, RACI, auditorias, revisão pela direção |
| RSK-* | Riscos: metodologia, registro, tratamento, oportunidades |
| SEC-* | Segurança da informação (quando houver escopo SGSI) |

**Outros idiomas:** [English](../../en/certificacion-iso/iso-package-index.md) · [Español](../../es/certificacion-iso/indice-paquete-iso.md)
