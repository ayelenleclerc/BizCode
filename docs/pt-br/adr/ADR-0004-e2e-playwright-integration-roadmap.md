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
2. **Integração com PostgreSQL (fase B — implementada):** o workflow do GitHub Actions fornece **PostgreSQL 16** e executa `npx prisma migrate deploy` antes das etapas de teste. Testes **automatizados** em `tests/integration/` (`npm run test:integration`, `vitest.integration.config.ts`): `PrismaClient` real, HTTP via supertest, tabelas limpas com `TRUNCATE … CASCADE` entre casos. Complementam (não substituem) os testes de contrato com Prisma mockado. Mudanças relevantes de cobertura ou CI continuam documentadas em ADR.
3. **Escopo de cobertura Vitest:** qualquer expansão de `coverage.include` em `vitest.config.ts` além de `src/lib/**/*.ts`, `server/createApp.ts` e `server.ts` exige **novo ADR** e thresholds explícitos (sem expansão silenciosa). O bootstrap de `server.ts` está em [ADR-0005](ADR-0005-vitest-coverage-server-bootstrap.md).

## Consequências

- **Positivo:** smoke E2E repetível no CI; fronteira clara entre testes web SPA e desktop Tauri.
- **Negativo:** tempo de CI e cache do navegador Playwright; `build:web` antes do preview (custo do job E2E).
- **Manutenção:** atualizar Playwright e smokes quando rotas ou bootstrap mudarem; alinhar `playwright.config.ts` à porta do `vite preview`.

## Referências

- [estrategia-testes.md](../quality/estrategia-testes.md)
- `playwright.config.ts`, `e2e/smoke.spec.ts`
- `vitest.integration.config.ts`, `tests/integration/`
- `.github/workflows/ci.yml`
