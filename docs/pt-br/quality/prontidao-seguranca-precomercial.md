# Prontidão de segurança pré-comercial (#194)

**Papel:** Avaliação go/no-go de controles de segurança **antes de dados reais de clientes / cobranças reais**.  
**Issue:** [#194](https://github.com/ayelenleclerc/BizCode/issues/194) · bloco [#452](https://github.com/ayelenleclerc/BizCode/issues/452)  
**Data da evidência:** 2026-11-08 contra `develop` (branch `docs/194-security-readiness-gate`).

Este documento **não** contrata vendor, não inventa achados nem fecha #194. O [registro de relatório de pentest](../../evidence/pentest-report-register.md) vazio permanece residual bloqueante do AC completo.

## Escopo

| No escopo | Fora do escopo |
|-----------|----------------|
| Inventário CI vs AC da issue | Contratar opções A/B/C |
| Gaps explícitos (ZAP `-I`, token Snyk, registro vazio) | Relatório externo simulado |
| Go/no-go para uso de **dados reais** | Fechar #194 ou afirmar pronto comercial |
| Links para testes de penetração + matriz piloto | Implementar FCEM / status page / DR staging |

## Critérios de aceitação vs evidência no repositório

| AC #194 (issue) | Evidência no repo | Status |
|-----------------|-------------------|--------|
| Varredura automática (ZAP + Snyk) no CI/CD antes de prod | [`.github/workflows/zap.yml`](../../../.github/workflows/zap.yml); [`.github/workflows/snyk.yml`](../../../.github/workflows/snyk.yml); `pnpm audit --audit-level=high` no Quality Gate | **Parcial** — ZAP com `-I` (não falha em WARN); Snyk **omite** sem `SNYK_TOKEN` |
| Zero Critical/High sem mitigar antes do lançamento | Audit + Snyk (com token) + triagem de dependências (#219) | **Condicional** — gate HIGH+ do audit existe; Snyk não garantido; WARN ZAP não bloqueia merge |
| Relatório de pentest externo + plano de remediação | [pentest-report-register.md](../../evidence/pentest-report-register.md) | **Não evidenciado** — registro vazio |
| Critical do relatório externo mitigados antes do lançamento comercial | N/A até existir relatório | **Bloqueado** por decisão vendor/orçamento (#452) |

## Checklist pré-engagement vs evidência

| Tarefa prévia #194 | Evidência / nota |
|--------------------|------------------|
| Audit + atualizar deps vulneráveis | Quality Gate audit HIGH+; [varredura-dependencias-e-triagem.md](varredura-dependencias-e-triagem.md) |
| Varredura Snyk | Workflow presente; enforcement depende do secret `SNYK_TOKEN` |
| Revisar endpoints | Trabalho contínuo de produto — **não** fechado por este doc |
| SQL raw sem sanitizar | Política em [testes-de-penetracao.md](testes-de-penetracao.md); revisar código antes do vendor |
| Logs sem tokens/senhas/PII | Checklist em [seguranca.md](../seguranca.md) — confirmação ops |

## Go / no-go — dados reais de clientes

### Go (apenas piloto / sintético)

1. Gates técnicos do piloto (#446–#451, #450) separados da segurança comercial.
2. Sem PII real / dados fiscais de produção / cobranças live Mercado Pago no ambiente sob teste.
3. Ops reconhece os gaps residuais da tabela abaixo.

### No-go (dados reais / cobranças comerciais)

**No-go** se:

1. Registro de pentest externo vazio **e** a proprietária não aceitou por escrito o risco residual para um piloto limitado.
2. `SNYK_TOKEN` ausente no repositório que faz deploy do host comercial.
3. ZAP com `-I` sem triagem documentada de WARN **e** sem controle compensatório aceito.
4. Critical/High de dependências abertos sem ADR/exceção.

**Veredito 2026-11-08:** **NO-GO para dados reais** — MVP automatizado (opção D) parcial; AC de relatório externo não cumprido; ZAP não bloqueante; Snyk condicional.

## Gaps explícitos (não inventar)

| Gap | Local | Impacto |
|-----|-------|---------|
| Registro externo vazio | `docs/evidence/pentest-report-register.md` | Bloqueia AC completo #194 |
| ZAP `-I` | `.github/workflows/zap.yml` | WARN não falha CI |
| Snyk opcional | `.github/workflows/snyk.yml` | Gate omitido sem token |
| Contratar vendor | Orçamento / #452 | Não é tarefa de código Cursor |

## Relacionado

- [Testes de penetração](testes-de-penetracao.md)
- [Matriz de cobertura do piloto](matriz-cobertura-piloto-distribuidora.md)
- [SLA](sla.md) / [Recuperação de desastres](recuperacao-de-desastres.md) (#197)

## Outros idiomas

- English: [pre-commercial-security-readiness.md](../../en/quality/pre-commercial-security-readiness.md)
- Español: [readiness-seguridad-precomercial.md](../../es/quality/readiness-seguridad-precomercial.md)

## Histórico

| Versão | Data | Autor | Resumo |
|--------|------|-------|--------|
| 0.1 | 2026-11-08 | BizCode | Avaliação inicial de prontidão #194 |
