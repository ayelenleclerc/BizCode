# ADR-0004: Automação E2E (Playwright) e roteiro de testes de integração

**Status:** Aceita  
**Data:** 2026-03-31  
**Referência ISO:** ISO/IEC 29119-2, ISO/IEC 12207:2017 §6.4.9

---

## Contexto

- Testes de contrato ([ADR-0003](ADR-0003-api-contract-testing.md)) mocam Prisma e validam HTTP + OpenAPI; não provam o stack completo contra banco real.
- O **desktop** é Tauri + WebView; a **UI web** é Vite + React.
- É necessária uma abordagem **faseada e documentada** para E2E automatizado e futuros testes de integração com PostgreSQL sem declarar cobertura ou ferramentas inexistentes no CI.

## Decisão

1. **E2E automatizado (fase A — implementada):** usar **Playwright** contra **`vite preview`** após `vite build`. Testes em `e2e/`; o CI instala apenas **Chromium** e executa `npm run test:e2e`. Escopo inicial: **smoke** (rota raiz carrega, `#root` visível, título do documento). Valida o invólucro da SPA; **não** substitui testes manuais do shell Tauri nem integrações nativas.
2. **Integração com PostgreSQL (fase B — não implementada aqui):** o workflow do GitHub Actions já fornece serviço **PostgreSQL 16**. Adicionar testes **automatizados** com migrações, seed e asserções HTTP sobre DB real fica **adiado** até item de backlog: novo ADR se mudarem thresholds ou CI de forma relevante, e layout explícito em `tests/integration/` (ou similar).
3. **Escopo de cobertura Vitest:** qualquer expansão de `coverage.include` em `vitest.config.ts` além de `src/lib/**/*.ts` e `server/createApp.ts` exige **novo ADR** e thresholds explícitos (sem expansão silenciosa).

## Consequências

- **Positivo:** smoke E2E repetível no CI; fronteira clara entre testes web SPA e desktop Tauri.
- **Negativo:** tempo de CI e cache do navegador Playwright; `build:web` antes do preview (custo do job E2E).
- **Manutenção:** atualizar Playwright e smokes quando rotas ou bootstrap mudarem; alinhar `playwright.config.ts` à porta do `vite preview`.

## Referências

- [estrategia-testes.md](../quality/estrategia-testes.md)
- `playwright.config.ts`, `e2e/smoke.spec.ts`
- `.github/workflows/ci.yml`
