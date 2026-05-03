# ADR-0006: CI opcional — semantic-release e build Tauri self-hosted

**Status:** Aceita  
**Data:** 2026-03-31  
**Referência ISO:** ISO/IEC 12207:2017 §6.4.9 (implantação / release)

---

## Contexto

O pipeline padrão ([ciclo-ci-cd.md](../quality/ciclo-ci-cd.md)) não publica releases nem gera artefatos Tauri desktop. O backlog de melhorias **opcionais** incluía `npm audit` não bloqueante, **semantic-release** e **Tauri** em runner self-hosted.

## Decisão

1. **`npm audit`:** o workflow executa `npm audit --audit-level=high` após `npm ci` com **`continue-on-error: true`**.
2. **semantic-release:** `release.config.cjs` na raiz; `.github/workflows/release.yml` apenas **`workflow_dispatch`**, cria GitHub Releases a partir de commits convencionais em `main` com `GITHUB_TOKEN`. Sem publicação npm (`private`).
3. **Tauri self-hosted:** `.github/workflows/tauri-selfhosted.yml` apenas **`workflow_dispatch`** em **`runs-on: self-hosted`**. O runner precisa de Rust, Node e dependências WebView nativas.

## Consequências

- **Positivo:** automação opcional documentada; o gate de qualidade padrão não muda.
- **Negativo:** semantic-release e Tauri exigem disparo manual e runner adequado.

## Gate de release (operador / desktop)

1. **`main`** precisa estar verde no **Quality Gate** (`ci.yml`): API, documentação gerada consistente, ESLint, thresholds Vitest em `vitest.config.ts`, Playwright (`vite build` + preview) e PostgreSQL nos testes de integração.
2. Antes de publicar instaladores desktop, rode **Actions → Tauri self-hosted** (`tauri-selfhosted.yml`) em runner próprio com Rust + WebView. **Não roda em todo PR** e não substitui o gate web descrito como *Fora do CI* em [ciclo-ci-cd.md](../quality/ciclo-ci-cd.md).
3. Com semantic-release/tag, dispare **`release.yml`** (`workflow_dispatch` na `main`) após confirmar (2).

## Referências

- [ciclo-ci-cd.md](../quality/ciclo-ci-cd.md)
- `release.config.cjs`, `.github/workflows/release.yml`, `.github/workflows/tauri-selfhosted.yml`
