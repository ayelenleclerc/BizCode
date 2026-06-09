# Guia de Teste E2E — Playwright

**Data:** 2026-04-17 | **Status:** Em Progresso | **Cobertura:** 10 testes de critical paths

---

## 🎯 Visão Geral

Testes E2E (End-to-End) validam workflows completos do usuário usando [Playwright](https://playwright.dev/). Os testes são executados contra a prévia do Vite em `http://127.0.0.1:4173`.

**Suite Atual:**
- `e2e/smoke.spec.ts` — Teste básico (app carrega)
- `e2e/critical-paths.spec.ts` — 10 testes de workflows críticos

---

## 🚀 Executar Testes E2E

### Início Rápido

```bash
# Construir app React e iniciar servidor de prévia
npm run build:web
npx vite preview --host 127.0.0.1 --port 4173

# Em outro terminal, executar testes E2E
npm run test:e2e
```

### Comando Completo CI (como em GitHub Actions)

```bash
npm run test:e2e
```

Este comando:
1. Constrói a app React com `vite build`
2. Inicia servidor de prévia em `http://127.0.0.1:4173`
3. Executa testes Playwright em `e2e/**/*.spec.ts`
4. Gera relatório de testes
5. Limpa o servidor

### Executar Teste Específico

```bash
# Apenas testes de critical-paths
npx playwright test e2e/critical-paths.spec.ts

# Testes que correspondem ao padrão
npx playwright test -g "Navigate"

# Modo headed (ver browser)
npx playwright test --headed

# Modo debug (passo a passo)
npx playwright test --debug
```

---

## 📋 Cobertura Atual

### Suite: `critical-paths.spec.ts`

#### Testes de Navegação
- ✅ App carrega e mostra home page
- ✅ Navegar para página de Clientes
- ✅ Navegar para página de Artigos
- ✅ Navegar para página de Faturação

#### Testes de Workflows
- ✅ Criar novo cliente
  - Abre formulário (F3)
  - Preenche campos
  - Salva com F5
  
- ✅ Criar novo artigo
  - Abre formulário (F3)
  - Preenche campos
  - Salva com F5
  
- ✅ Criar nova fatura
  - Navega para faturação
  - Verifica que página carrega

#### Testes de Integração
- ✅ Navegação completa entre módulos
- ✅ Atalhos de teclado (F3, F5, Esc)
- ✅ App é responsivo (mobile viewport)

#### Testes de Validação
- ✅ Validação de CNPJ em clientes
- ✅ Validação de preços em artigos

---

## 🔧 Configuração

**Arquivo:** `playwright.config.ts`

```typescript
{
  testDir: './e2e',
  baseURL: 'http://127.0.0.1:4173',
  fullyParallel: true,
  retries: process.env.CI ? 1 : 0,
}
```

---

## 🎯 Próximos Passos

### Fase 1: Estabilizar Testes Atuais (Semana 1)

- [ ] Adicionar `data-testid` em formulários
- [ ] Extrair dados de teste em fixtures
- [ ] Adicionar guardas `waitForNavigation()`
- [ ] Testes com valores CNPJ reais

**Esforço:** 2-3 horas

### Fase 2: Expandir Critical Paths (Semana 2)

**Workflow Completo de Fatura:**
```
1. Navegar para /faturacao
2. Criar nova fatura
3. Selecionar cliente
4. Adicionar artigos (tecla Ins)
5. Verificar cálculo de IVA
6. Salvar fatura (F5)
7. Verificar em listagem
```

**Esforço:** 4-6 horas

### Fase 3: Testes de Autenticação (Semana 3)

- ✅ Login com credenciais válidas
- ✅ Login com credenciais inválidas
- ✅ Rotas protegidas redirecionam
- ✅ Logout funciona
- ✅ Persistência de sessão

**Esforço:** 2-3 horas

---

## 🛠️ Debugging

### Modo Headed (Ver Browser)

```bash
npx playwright test --headed
```

### Modo Debug (Passo a Passo)

```bash
npx playwright test --debug
```

Abre Playwright Inspector para controlar execução.

---

## 📝 Escrever Novos Testes

### Template

```typescript
test('Descrição do feature', async ({ page }) => {
  // ARRANGE: Preparar dados de teste
  const dados = { ... }
  
  // ACT: Realizar ações do usuário
  await page.goto('/alguma-pagina')
  await page.click('button:has-text("Criar")')
  
  // ASSERT: Verificar resultados
  await expect(page.locator('#resultado')).toHaveText('Sucesso')
})
```

### Melhores Práticas

✅ **FAÇA:**
- Nomes claros descrevendo o que os usuários fazem
- Adicionar waits: `page.waitForLoadState('networkidle')`
- Usar `data-testid` para seletores estáveis
- Testes independentes (não depender de outros)

❌ **NÃO FAÇA:**
- Hardcodear IDs específicos
- Testes que dependem um do outro
- Testes de detalhes de implementação

---

## 📊 Objetivos de Cobertura

| Métrica | Objetivo | Atual | Status |
|---------|----------|-------|--------|
| Testes de navegação | 5+ | 4 | 🟡 |
| Testes de workflow | 3+ | 3 | 🟢 |
| Testes de validação | 5+ | 2 | 🔴 |
| Workflows completos | 2+ | 0 | 🔴 |

---

**Status Atual:** 🟡 Em Progresso (10 testes, pronto para expandir)  
**Próxima Sessão:** Fase 2 (Workflow completo de fatura) + Fase 3 (Autenticação)
