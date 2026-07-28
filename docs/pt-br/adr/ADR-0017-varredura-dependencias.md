# ADR-0017: Varredura de vulnerabilidades em dependências e containers

**Status:** Aceito  
**Data:** 2026-07-28  
**Referência ISO:** ISO/IEC 27001:2022 A.8.8 (gestão de vulnerabilidades técnicas); A.5.23 (segurança da informação para uso de serviços em nuvem)

---

## Contexto

O BizCode já executa `pnpm audit` informativo, CodeQL, Gitleaks, SBOM CycloneDX e Trivy **IaC** em Terraform. O issue #219 exige PRs automáticos do Dependabot, CI bloqueante para HIGH (Snyk + audit), varredura de **imagens** Docker (Trivy) antes do push ao registry, badge no README e processo de triage documentado. O monorepo usa **pnpm** (`pnpm-lock.yaml`).

## Decisão

1. **Dependabot:** `.github/dependabot.yml` com ecossistema `npm` em `/` (workspace pnpm) e `github-actions` em `/`, schedule **weekly**, grupos de **patch**.
2. **Audit gate:** Quality Gate executa `pnpm audit --audit-level=high` **sem** `continue-on-error`.
3. **Snyk:** Job de Actions com segredo `SNYK_TOKEN`. `snyk test --severity-threshold=high --fail-on=upgradable` em PR/push; `snyk monitor` em push para `develop`/`main`. Sem token, o job falha com mensagem acionável.
4. **Trivy imagens:** Após `docker build` no Deploy Containers, escanear tags locais; **falhar em CRITICAL** antes de publicar no GHCR.
5. **Documentação:** Guia de triage trilingue em `docs/*/quality/`. Badge Snyk no README para `ayelenleclerc/BizCode` (ops deve vincular o repo no Snyk uma vez). A geração SBOM usa `pnpm dlx @cyclonedx/cdxgen` (compatível com pnpm 10) em vez de `@cyclonedx/cyclonedx-npm`.
6. **Fora de escopo v1:** Socket.dev, Renovate, `dependency-review-action`, hardening mobile (#220).

## Consequências

- **Positivo:** PRs de deps automatizados; detecção multicamada; evidência ISO de vulnerabilidades técnicas.
- **Negativo:** Requer `SNYK_TOKEN`; primeiras execuções podem falhar até remediar HIGH/CRITICAL com fix ou atualizar imagens base.
- **Remediação:** Preferir bumps patch/minor na mesma mudança; exceções temporárias devem constar neste ADR com validade (nenhuma na aceitação).
- **Ignore de audit aceito (2026-07-28):** `pnpm.auditConfig.ignoreCves` inclui `CVE-2026-14257` (`brace-expansion` / GHSA-mh99-v99m-4gvg). O intervalo publicado `<=5.0.7` também casa com linhas já fixadas `1.1.16` / `2.1.3`; a árvore força `brace-expansion@5` para `5.0.8`. Revisar quando o advisory publicar intervalos por major ou quando o minimatch abandonar majors legacy. Revisão: **2026-10-28**.

## Referências

- Issue #219
- [Triage de varredura de dependências](../quality/varredura-dependencias-e-triagem.md)
- [CI/CD](../quality/ciclo-ci-cd.md)
