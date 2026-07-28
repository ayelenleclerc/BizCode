# Varredura de dependências e triagem (#219)

## Propósito

Como responder a alertas do Dependabot, `pnpm audit`, Snyk e Trivy (imagens) no BizCode.

Decisão normativa: [ADR-0017](../adr/ADR-0017-varredura-dependencias.md).

## Ferramentas no CI

| Ferramenta | Onde | Gate |
|------------|------|------|
| Dependabot | `.github/dependabot.yml` | Abre PRs semanais (npm workspace + GitHub Actions); revisar e fazer merge |
| `pnpm audit --audit-level=high` | Quality Gate (`ci.yml`), `dependency-maintenance.yml` | **Bloqueia** HIGH+ (ver ADR para `ignoreCves` aceitos) |
| Snyk `test` / `monitor` | `.github/workflows/snyk.yml` | **Bloqueia** HIGH+ com fix (`--fail-on=upgradable`) se houver `SNYK_TOKEN`; omite com warning se faltar |
| Trivy image | `deploy.yml` após `docker build` | **Bloqueia** CRITICAL antes do push ao GHCR |
| Trivy IaC | `infrastructure-validation.yml` | Terraform (existente) |
| SBOM CycloneDX | `docs/evidence/sbom-cyclonedx.json` | Regenerar com `pnpm run sbom:generate` (`pnpm dlx @cyclonedx/cdxgen`) / `docs:generate` |

## Setup: `SNYK_TOKEN`

1. Criar conta Snyk e vincular o repo GitHub `ayelenleclerc/BizCode`.
2. Criar token de serviço com acesso ao projeto.
3. Adicionar segredo de repositório **`SNYK_TOKEN`**.
4. Sem o segredo, o workflow Snyk omite o scan e emite um warning (o `pnpm audit` do Quality Gate continua bloqueando). Adicionar o segredo para forçar o Snyk.

## Setup: badge Snyk no README

O badge do README reflete o status Snyk do repo. Após vincular o projeto no Snyk, atualiza sozinho. Se aparecer “unknown”, confirme a integração na UI do Snyk.

## Playbook de triagem

1. **Origem:** PR do Dependabot, log de audit no CI, UI/CLI Snyk ou passo Trivy image.
2. **Severidade:** CRITICAL/HIGH com fix publicado → remediar antes do merge. Moderate → agendar.
3. **Preferir:** bump de dependência direta ou `pnpm.overrides` pontual; `pnpm install` e `pnpm audit --audit-level=high`.
4. **Containers:** subir tags `FROM` nos Dockerfiles se CRITICAL estiver na imagem base; rebuild e re-scan. O runtime da API remove o `npm` embutido do Node (`tar` vulnerável). Forçar `esbuild` ≥ 0.28.1 via `pnpm.overrides` para gobinary com Go stdlib corrigido (CVE-2025-68121).
5. **Exceções:** só via `pnpm.auditConfig.ignoreCves` (ou emenda ao ADR) com motivo e data de revisão — nunca `continue-on-error` silencioso no audit do Quality Gate.
6. **Verificar:** audit local exit 0; push e confirmar jobs Snyk + Trivy verdes.

## Fora de escopo

Socket.dev, Renovate, certificate pinning mobile (#220).
