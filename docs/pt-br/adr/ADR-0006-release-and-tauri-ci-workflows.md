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

## Referências

- [ciclo-ci-cd.md](../quality/ciclo-ci-cd.md)
- `release.config.cjs`, `.github/workflows/release.yml`, `.github/workflows/tauri-selfhosted.yml`
