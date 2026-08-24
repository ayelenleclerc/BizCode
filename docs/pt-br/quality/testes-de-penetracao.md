# Testes de penetração (#194)

## Propósito

Descreve como o BizCode prepara e registra **testes de penetração** antes do lançamento comercial: DAST automatizado (OWASP ZAP) no CI, gates de dependências do #219, e o engagement **externo** necessário para um relatório formal.

**Status de evidência:** o workflow ZAP baseline está implementado no CI. Um relatório de pentest **externo não está evidenciado** até a ops arquivar um entregável real do fornecedor. Não é reivindicação de certificação.

## O que está no CI e o que não está

| Controle | Local | Bloqueia merge? |
|----------|-------|-----------------|
| `pnpm audit --audit-level=high` | Quality Gate | Sim (HIGH+) |
| Snyk | [`.github/workflows/snyk.yml`](../../../.github/workflows/snyk.yml) | Sim com `SNYK_TOKEN` |
| OWASP ZAP baseline | [`.github/workflows/zap.yml`](../../../.github/workflows/zap.yml) | Não até remover `-I` após triagem |
| Relatório pentest externo | Ops + [registro](../../evidence/pentest-report-register.md) | Exigido para o AC completo do #194 |

**Relatórios ZAP do CI não substituem o relatório de pentest externo.**

## Workflow ZAP baseline

1. Em PR/push para `develop`/`main` e `workflow_dispatch`.
2. Alvo padrão: API efêmera em `http://127.0.0.1:3001`.
3. Variável de repositório opcional `ZAP_TARGET_URL` (somente staging/não prod). Fail-closed se inválida. **Não** apontar produção com dados ou segredos reais.
4. Docker com `--network host`.
5. Regras: [`.zap/rules.tsv`](../../../.zap/rules.tsv); após triagem, remover `-I`.
6. Artefato `zap-baseline-report` (14 dias). Não versionar relatórios sem revisão.

## Checklist de engenharia pré-engagement

Ver [seguranca.md](../seguranca.md).

## Engagement externo (ops)

Opções em [#194](https://github.com/ayelenleclerc/BizCode/issues/194). O MVP automatizado **não** fecha o AC do relatório externo.

1. Escolher fornecedor e escopo.
2. Somente **staging**; rotacionar credenciais ao terminar.
3. Preencher [pentest-report-register.md](../../evidence/pentest-report-register.md).
4. Issues de remediação; Critical/High antes do lançamento comercial.
5. Manter [#194](https://github.com/ayelenleclerc/BizCode/issues/194) **OPEN** até evidência real + acompanhamento dos críticos.

## Stubs ISO

- [SEC-010](../certificacion-iso/sec/sec-010-vulnerabilidades-patches.md)
- [SEC-013](../certificacion-iso/sec/sec-013-avaliacao-seguranca-fornecedores.md)

## Relacionado

- [seguranca.md](../seguranca.md)
- [varredura-dependencias-e-triagem.md](varredura-dependencias-e-triagem.md)
- [ciclo-ci-cd.md](ciclo-ci-cd.md)

**Outros idiomas:** [English](../en/quality/penetration-testing.md) · [Español](../es/quality/pruebas-de-penetracion.md)
