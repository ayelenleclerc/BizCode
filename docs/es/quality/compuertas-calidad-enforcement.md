# Quality Gates Enforcement — Setup Completo

**Fecha:** 2026-04-17 | **Estado:** IMPLEMENTADO Y ACTIVO

---

## 🎯 Objetivo

Enforcar calidad de código, estándares de arquitectura y reglas de governance **automáticamente** en 3 capas:
1. **Local** — Antes de commits (pre-commit hooks)
2. **CI/CD** — Antes de merge (GitHub Actions workflows)
3. **Proceso** — Antes de implementación (Definition of Ready)

---

## 📊 Capas de Quality Gates

```
Desarrollador commitea código
        ↓
❌ [CAPA 1: LOCAL]
   └─ Pre-commit hook ejecuta: npm run lint
   └─ Bloquea commit si lint falla
        ↓
✅ COMMIT EXITOSO
        ↓
   Desarrollador hace push a rama feature
        ↓
❌ [CAPA 2: CI/CD]
   └─ GitHub Actions ejecuta en cada PR a main:
      ├─ TypeScript type-check
      ├─ ESLint (0 warnings)
      ├─ Unit tests + coverage
      ├─ E2E smoke tests (Playwright)
      ├─ Integration tests (PostgreSQL)
      ├─ Validación i18n parity (ES/EN/PT-BR)
      └─ Validación de documentación
   └─ Bloquea merge si ALGÚN check falla
        ↓
✅ TODOS LOS CHECKS PASAN
        ↓
   Revisión de PR + aprobación
        ↓
❌ [CAPA 3: REVISIÓN]
   └─ Validación CODEOWNERS
   └─ Branch protection rules enforzan:
      ├─ Mínimo 1 aprobación
      ├─ Status checks pasados
      └─ No force-push
        ↓
✅ MERGE A MAIN
```

---

## 🔧 CAPA 1: LOCAL — Pre-commit Hooks

### Cómo funciona

**Antes de cada commit**, Husky + lint-staged ejecutan automáticamente:

```bash
$ git commit -m "feat: nueva característica"

husky - pre-commit hook triggered
↓
npx lint-staged
├─ Ejecuta ESLint --fix en *.{ts,tsx} modificados
└─ Si algún archivo falla → commit BLOQUEADO
npm run type-check
└─ Verificación TypeScript (tsc --noEmit) → commit BLOQUEADO si falla
```

### Configuración

**Archivo:** `.husky/pre-commit`
```bash
#!/bin/sh
. "$(dirname "$0")/_/husky.sh"

npx lint-staged
npm run type-check
```

**Archivo:** `package.json`
```json
{
  "lint-staged": {
    "*.{ts,tsx}": [
      "eslint --fix --max-warnings 0"
    ]
  }
}
```

### Qué se valida

| Validación | Herramienta | Regla | ¿Bloquea commit? |
|-----------|------------|-------|---|
| Estilo de código | ESLint | jsx-a11y + TypeScript | ✅ SÍ |
| Formato | ESLint | Indentación consistente | ✅ SÍ |
| Imports no utilizados | ESLint | Remover unused | ✅ SÍ |
| Accesibilidad | jsx-a11y | WCAG 2.1 AA compliance | ✅ SÍ |

### Experiencia del Desarrollador

**Escenario 1: Código pasa lint**
```bash
$ git commit -m "feat: agregar componente Button"

husky - pre-commit hook
lint-staged: verificado 1 archivo
✅ Éxito — commit permitido
```

**Escenario 2: Código falla lint**
```bash
$ git commit -m "feat: variable sin usar en componente"

husky - pre-commit hook
lint-staged: verificado 1 archivo
❌ ESLint error: 'foo' is defined but never used (no-unused-vars)
✖ Arregla el error e intenta de nuevo

$ npm run lint:fix  # Auto-fix donde sea posible
$ git add src/pages/MyComponent.tsx
$ git commit -m "feat: agregar componente Button"
✅ Éxito — commit permitido
```

---

## 🔐 CAPA 2: CI/CD — GitHub Actions

### Workflows

**Principal:** `.github/workflows/ci.yml` (ejecuta en cada PR a main)

**Validadores especializados** (ejecutan en cambios de rutas específicas):
- `.github/workflows/backend-validation.yml` → En cambios `server/**`
- `.github/workflows/frontend-validation.yml` → En cambios `src/**`
- `.github/workflows/devops-validation.yml` → En cambios `Dockerfile`, docker-compose
- `.github/workflows/infrastructure-validation.yml` → En cambios `terraform/**`
- `.github/workflows/qa-validation.yml` → En cambios de tests

### Checks principales de CI

| Validación | Comando | Propósito | ¿Bloquea merge? |
|-----------|---------|----------|---|
| Type-check | `npm run type-check` | Detectar errores de tipo | ✅ SÍ |
| Lint | `npm run lint` | Estilo de código | ✅ SÍ |
| Unit tests | `npm run test:coverage` | Validación de lógica | ✅ SÍ |
| E2E tests | `npm run test:e2e` | Critical paths | ✅ SÍ |
| Integration tests | `npm run test:integration` | Interacciones DB | ✅ SÍ |
| i18n parity | `npm run check:i18n` | Sincronización ES/EN/PT-BR | ✅ SÍ |
| Validación docs | `npm run check:docs-map` | Documentación sincronizada | ✅ SÍ |
| SBOM generation | `npm run sbom:generate` | Auditoría de dependencias | ✅ SÍ |

### Branch Protection Rules (Requeridas)

En GitHub repositorio settings → Branches → main:

```
✅ Require a pull request before merging
   ├─ Require code reviews before merging
   │  └─ Required number of approvals: 1
   │
   ├─ Require status checks to pass before merging
   │  └─ Require branches to be up to date before merging
   │  └─ Status checks:
   │     ├─ Quality Gate (ci.yml)
   │     ├─ backend-validation (si backend cambió)
   │     └─ frontend-validation (si frontend cambió)
   │
   ├─ Dismiss stale pull request approvals when new commits are pushed
   │
   ├─ Require conversation resolution before merging
   │
   └─ Include administrators (enforce incluso para admins)
```

---

## 📋 CAPA 3: PROCESO — Definition of Ready

### Issue Template

**Archivo:** `.github/ISSUE_TEMPLATE/dor-acceptance-criteria.md`

Todo issue DEBE incluir:

1. **Criterio de Aceptación:**
   ```markdown
   - [ ] [Comando/Ruta] valida la solución
   - [ ] `npm run lint` pasa sin warnings
   - [ ] `npm run type-check` pasa sin errores
   ```

2. **Identificación de Área:**
   - `area: backend`
   - `area: frontend`
   - `area: devops`
   - `area: infrastructure`
   - `area: qa`
   - `area: iso-documentation`
   - `area: cybersecurity`

3. **Prioridad:**
   - `priority: p0` — Blocker
   - `priority: p1` — Next sprint
   - `priority: p2` — Post-MVP

---

## ✅ Definition of Done (DoD)

Todo commit mergeado DEBE satisfacer:

```
✅ Checks automáticos pasados
   ├─ npm run lint (0 warnings)
   ├─ npm run type-check (sin errores)
   ├─ npm run test (todos pasan)
   └─ npm run test:e2e (critical paths pasan)

✅ Cambios documentados
   ├─ ¿API? Actualiza docs/api/openapi.yaml
   ├─ ¿UI? Actualiza src/locales/{es,en,pt-BR}/*.json
   ├─ ¿Base de datos? Crea migration de Prisma
   └─ ¿Cambio mayor? Actualiza ADR o documentación

✅ Código revisado
   ├─ CODEOWNERS aprobó
   ├─ Al menos 1 aprobación
   └─ Todas las conversaciones resueltas

✅ Estándares cumplidos
   ├─ Sigue .cursor/rules/* standards
   ├─ Coincide con patrones arquitectónicos
   └─ Sin anti-patterns introducidos
```

---

## 🚀 Resumen: De código a producción

```
1. [LOCAL] Desarrollador escribe código
   └─ Pre-commit: npm run lint valida
   └─ Si falla → no puede commitear

2. [LOCAL] Código cumple estándares
   └─ Desarrollador: git commit ✅
   └─ Desarrollador: git push ✅

3. [CI/CD] GitHub Actions valida
   └─ Type-check ✅
   └─ Lint ✅
   └─ Tests ✅
   └─ E2E ✅
   └─ Si alguno falla → PR se bloquea

4. [REVISIÓN] Code owner aprueba
   └─ CODEOWNERS solicita revisión
   └─ Revisor verifica DoD
   └─ Si está bien → aprueba ✅

5. [MERGE] Branch protection valida
   └─ Todos los checks pasaron ✅
   └─ Revisado & aprobado ✅
   └─ Botón de merge disponible ✅

6. [DEPLOY] Código llega a main
   └─ Listo para producción ✅
```

---

**Este sistema asegura que CADA commit a main haya sido validado por:**
- ✅ Checks automáticos de lint + type (local + CI)
- ✅ Tests unitarios + integración + E2E
- ✅ Revisión humana por experto del dominio
- ✅ Checklist de governance (DoR + DoD)

**Resultado:** Código listo para producción, siempre.
