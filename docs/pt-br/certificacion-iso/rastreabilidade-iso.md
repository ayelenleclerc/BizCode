# Matriz de rastreabilidade ISO

Mapa dos artefactos de qualidade do BizCode para cláusulas ISO. Documentação Markdown em **três idiomas** (`docs/en/`, `docs/es/`, `docs/pt-br/`) com **nomes de arquivo localizados** por idioma. Ver [I18N_DOCUMENTATION.md](../../I18N_DOCUMENTATION.md) e [DOCUMENT_LOCALE_MAP.md](../../DOCUMENT_LOCALE_MAP.md). O **registro mestre do pacote ISO** é [indice-pacote-iso.md](indice-pacote-iso.md) (ver também [Certificación-ISO/README.md](../../../Certificación-ISO/README.md)).

| Artefacto | ISO 9001:2015 | ISO/IEC 12207 | ISO/IEC 27001 | ISO/IEC 25010 | ISO/IEC 29119 |
|---|---|---|---|---|---|
| **indice-pacote-iso.md** (ISO-PKG-001) + [Certificación-ISO/README.md](../../../Certificación-ISO/README.md) | §7.5 | §6.1.3 | — | — | — |
| **docs/evidence/sbom-cyclonedx.json** (SBOM-001) + [`npm run sbom:generate`](../../../package.json) | §8.1 | §6.3.8 | A.8.31 | — | — |
| TESTING_STRATEGY + Vitest | §8.7 | §6.4.9 | — | Confiabilidade | 29119-2, 29119-4 |
| ACCESSIBILITY + jsx-a11y | §8.1 | — | — | Usabilidade | — |
| I18N_STRATEGY + check-i18n | §8.1 | — | — | Portabilidade | — |
| SECURITY | §8.1 | §6.3.8 | A.8.x | Segurança | — |
| **quality/observabilidade.md** + `server/middleware/observability.ts` + `GET /api/metrics` (`audit.read`) | §8.1 | §6.3.2, §6.4.9 | A.8.15 (logging), A.8.16 (monitoramento) | Confiabilidade, Segurança | 29119-2 |
| openapi.yaml + contract tests | §8.3 | §6.3.2 | — | Adequação funcional | 29119-2 |
| **ADR-0012 / notas de crédito (#146)** — `PUT /api/facturas/{id}/void`, `GET /api/notas-credito`, UI faturamento / finanças, `tests/api/notas-credito.test.ts`, `tests/api/facturas-void.test.ts` | §8.3 | §6.3.2 | — | Adequação funcional | 29119-2 |
| **ADR-0013 / Livro IVA Vendas Fase 1 (#147)** — `GET /api/contabilidad/libro-iva-ventas`, UI finanças, `tests/api/libro-iva-ventas.test.ts`, `tests/server/fiscal/ar/libroIvaVentas.test.ts` | §8.3 | §6.3.2 | — | Adequação funcional | 29119-2 |
| plano-swagger-openapi-ui.md (espelhos EN/ES) — checklist Swagger UI, política OpenAPI agentes | §7.5, §8.3 | §6.3.2, §6.4.12 | — | Adequação funcional | 29119-2 |
| ADR-0003 (contrato API) | §8.3.3 | §6.3.6 | — | Manutenibilidade | — |
| **visao-produto-e-implantacao.md** (espelhos EN/ES, **PROD-VISION-001**) — direção desktop/SaaS, modularidade fiscal | §7.5, §8.3 | §6.3.2 | — | Portabilidade §4.2.8 | — |
| **ADR-0007** (implantação dual / modularidade fiscal) | §8.3.3 | §6.3.2 | — | Manutenibilidade §4.2.7 | — |
| CI_CD + workflow | §8.5 | §6.3.6 | A.8.25 | — | — |
| QUALITY_MANUAL | §4.4, §10.2 | §6.1 | — | — | — |
| ADR-0001, ADR-0002 | §8.3.3 | §6.3.2 | — | — | — |
| PRIVACY_DATA_MAP | §8.1 | — | A.5.x | — | — |
| Manuais do usuário (clientes, produtos, faturamento, aparência, cobranças, finanças, relatórios, logística) | §7.5 | §6.4.12 | — | Usabilidade | — |
| API de cobranças + `tests/api/cobros.test.ts` | §8.3 | §6.3.2 | — | Adequação funcional | 29119-2 |
| **Logística** (#140–#145): manuais + `tests/api/repartos.test.ts`, `tests/api/ordenes-entrega.test.ts`, `tests/api/logistica-reportes.test.ts`, `repartoUbicacionService.test.ts`, `logisticaReportesService.test.ts`, OpenAPI repartos/GPS/rotas logística | §8.3 | §6.3.2 | A.5.12 (localização se `logistics.gps`) | Adequação funcional | 29119-2 |
| documentacao-gerada.md + `npm run docs:generate` | §7.5 | §6.4.12 | A.8.31 (SBOM) | Manutenibilidade | — |
| THEMING | §8.3 | §6.4.12 | — | Usabilidade | — |
| CONTRIBUTING DoD | §8.5.1 | §6.3.6 | A.8.25 | — | 29119-2 §7 |
| RECORDS_TEMPLATE | §10.2.2 | §6.7.1 | A.5.33 | — | 29119-3 |
| GLOSSARY | §7.5 | §6.1.3 | — | — | — |
| Pasta **`specs/`** (README, manual técnico, RF/RNF, casos de uso, histórias, casos de teste manual, matriz de rastreabilidade) | §8.3 | §6.4.12 | — | Adequação funcional | 29119-3 (catálogo MVP de testes manuais) |

## Notas

- ISO 29119: partes 2 e 4 cobertas pela estratégia; parte 3 (documentação de testes) com suporte MVP em `docs/*/specs/manual-test-cases.md` e registros em [modelos-registros.md](modelos-registros.md).

## Registro de documentos controlados (códigos GOV–PROC-MAN)

O **catálogo fechado** de stubs controlados está em [indice-pacote-iso.md](indice-pacote-iso.md). Cruzamento **código → cláusula** indicativo: [registro-rastreabilidade-documentos-normas.md](registro-rastreabilidade-documentos-normas.md). **Rastreabilidade entre documentos:** [rastreabilidade-entre-documentos.md](rastreabilidade-entre-documentos.md). Índice de manuais de processo: [../processes/indice.md](../processes/indice.md).

**Outros idiomas:** [English](../../en/certificacion-iso/iso-traceability.md) · [Español](../../es/certificacion-iso/trazabilidad-iso.md)
