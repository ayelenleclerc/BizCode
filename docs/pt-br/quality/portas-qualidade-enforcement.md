# Quality Gates Enforcement — Setup Completo

**Data:** 2026-04-17 | **Status:** IMPLEMENTADO E ATIVO

---

## 🎯 Objetivo

Enforçar qualidade de código, padrões de arquitetura e regras de governance **automaticamente** em 3 camadas:
1. **Local** — Antes de commits (pre-commit hooks)
2. **CI/CD** — Antes de merge (GitHub Actions workflows)
3. **Processo** — Antes de implementação (Definition of Ready)

---

## 📊 Camadas de Quality Gates

```
Desenvolvedor faz commit do código
        ↓
❌ [CAMADA 1: LOCAL]
   └─ Pre-commit hook executa: npm run lint
   └─ Bloqueia commit se lint falhar
        ↓
✅ COMMIT BEM-SUCEDIDO
        ↓
   Desenvolvedor faz push para branch feature
        ↓
❌ [CAMADA 2: CI/CD]
   └─ GitHub Actions executa em cada PR para main:
      ├─ TypeScript type-check
      ├─ ESLint (0 warnings)
      ├─ Unit tests + coverage
      ├─ E2E smoke tests (Playwright)
      ├─ Integration tests (PostgreSQL)
      ├─ Validação i18n parity (ES/EN/PT-BR)
      └─ Validação de documentação
   └─ Bloqueia merge se ALGUM check falhar
        ↓
✅ TODOS OS CHECKS PASSARAM
        ↓
   Revisão de PR + aprovação
        ↓
❌ [CAMADA 3: REVISÃO]
   └─ Validação CODEOWNERS
   └─ Branch protection rules enforcement:
      ├─ Mínimo 1 aprovação
      ├─ Status checks passados
      └─ Sem force-push
        ↓
✅ MERGE PARA MAIN
```

---

## 🔧 CAMADA 1: LOCAL — Pre-commit Hooks

### Como Funciona

**Antes de cada commit**, Husky + lint-staged executam automaticamente:

```bash
$ git commit -m "feat: nova funcionalidade"

husky - pre-commit hook triggered
↓
npx lint-staged
├─ Executa ESLint --fix em *.{ts,tsx} modificados
└─ Se algum arquivo falhar → commit BLOQUEADO
```

### Configuração

**Arquivo:** `.husky/pre-commit`
```bash
#!/bin/sh
. "$(dirname "$0")/_/husky.sh"

npx lint-staged
```

**Arquivo:** `package.json`
```json
{
  "lint-staged": {
    "*.{ts,tsx}": [
      "eslint --fix --max-warnings 0"
    ]
  }
}
```

### O que é validado

| Validação | Ferramenta | Regra | Bloqueia commit? |
|-----------|-----------|-------|---|
| Estilo de código | ESLint | jsx-a11y + TypeScript | ✅ SIM |
| Formatação | ESLint | Indentação consistente | ✅ SIM |
| Imports não utilizados | ESLint | Remover unused | ✅ SIM |
| Acessibilidade | jsx-a11y | WCAG 2.1 AA compliance | ✅ SIM |

---

## 🔐 CAMADA 2: CI/CD — GitHub Actions

### Workflows

**Principal:** `.github/workflows/ci.yml` (executa em cada PR para main)

**Validadores especializados** (executam em mudanças de caminhos específicos):
- `.github/workflows/backend-validation.yml` → Em mudanças `server/**`
- `.github/workflows/frontend-validation.yml` → Em mudanças `src/**`
- `.github/workflows/devops-validation.yml` → Em mudanças `Dockerfile`, docker-compose
- `.github/workflows/infrastructure-validation.yml` → Em mudanças `terraform/**`
- `.github/workflows/qa-validation.yml` → Em mudanças de testes

### Checks principais de CI

| Validação | Comando | Propósito | Bloqueia merge? |
|-----------|---------|----------|---|
| Type-check | `npm run type-check` | Detectar erros de tipo | ✅ SIM |
| Lint | `npm run lint` | Estilo de código | ✅ SIM |
| Unit tests | `npm run test:coverage` | Validação de lógica | ✅ SIM |
| E2E tests | `npm run test:e2e` | Critical paths | ✅ SIM |
| Integration tests | `npm run test:integration` | Interações com BD | ✅ SIM |
| i18n parity | `npm run check:i18n` | Sincronização ES/EN/PT-BR | ✅ SIM |
| Validação docs | `npm run check:docs-map` | Documentação sincronizada | ✅ SIM |
| SBOM generation | `npm run sbom:generate` | Auditoria de dependências | ✅ SIM |

---

## 📋 CAMADA 3: PROCESSO — Definition of Ready

### Issue Template

**Arquivo:** `.github/ISSUE_TEMPLATE/dor-acceptance-criteria.md`

Todo issue DEVE incluir:

1. **Critério de Aceitação:**
   ```markdown
   - [ ] [Comando/Caminho] valida a solução
   - [ ] `npm run lint` passa sem warnings
   - [ ] `npm run type-check` passa sem erros
   ```

2. **Identificação de Área:**
   - `area: backend`
   - `area: frontend`
   - `area: devops`
   - `area: infrastructure`
   - `area: qa`
   - `area: iso-documentation`
   - `area: cybersecurity`

3. **Prioridade:**
   - `priority: p0` — Blocker
   - `priority: p1` — Next sprint
   - `priority: p2` — Post-MVP

---

## ✅ Definition of Done (DoD)

Todo commit mergeado DEVE satisfazer:

```
✅ Checks automáticos passados
   ├─ npm run lint (0 warnings)
   ├─ npm run type-check (sem erros)
   ├─ npm run test (todos passam)
   └─ npm run test:e2e (critical paths passam)

✅ Mudanças documentadas
   ├─ API? Atualiza docs/api/openapi.yaml
   ├─ UI? Atualiza src/locales/{es,en,pt-BR}/*.json
   ├─ Banco de dados? Cria migration do Prisma
   └─ Mudança maior? Atualiza ADR ou documentação

✅ Código revisado
   ├─ CODEOWNERS aprovou
   ├─ Pelo menos 1 aprovação
   └─ Todas as conversas resolvidas

✅ Padrões cumpridos
   ├─ Segue .cursor/rules/* standards
   ├─ Corresponde aos padrões arquitetônicos
   └─ Sem anti-patterns introduzidos
```

---

## 🚀 Resumo: De código para produção

```
1. [LOCAL] Desenvolvedor escreve código
   └─ Pre-commit: npm run lint valida
   └─ Se falhar → não pode fazer commit

2. [LOCAL] Código atende aos padrões
   └─ Desenvolvedor: git commit ✅
   └─ Desenvolvedor: git push ✅

3. [CI/CD] GitHub Actions valida
   └─ Type-check ✅
   └─ Lint ✅
   └─ Tests ✅
   └─ E2E ✅
   └─ Se algum falhar → PR é bloqueado

4. [REVISÃO] Code owner aprova
   └─ CODEOWNERS solicita revisão
   └─ Revisor verifica DoD
   └─ Se OK → aprova ✅

5. [MERGE] Branch protection valida
   └─ Todos os checks passaram ✅
   └─ Revisado & aprovado ✅
   └─ Botão de merge disponível ✅

6. [DEPLOY] Código chega a main
   └─ Pronto para produção ✅
```

---

**Este sistema garante que CADA commit para main tenha sido validado por:**
- ✅ Checks automáticos de lint + type (local + CI)
- ✅ Tests unitários + integração + E2E
- ✅ Revisão humana por especialista do domínio
- ✅ Checklist de governance (DoR + DoD)

**Resultado:** Código pronto para produção, sempre.
