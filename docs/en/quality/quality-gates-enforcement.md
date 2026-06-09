# Quality Gates Enforcement — Complete Setup

**Date:** 2026-04-17 | **Status:** IMPLEMENTED & ACTIVE

---

## 🎯 Objective

Enforce code quality, architecture standards, and governance rules **automatically** across 3 layers:
1. **Local** — Before commits (pre-commit hooks)
2. **CI/CD** — Before merge (GitHub Actions workflows)
3. **Process** — Before implementation (Definition of Ready checklist)

---

## 📊 Quality Gate Layers

```
Developer commits code
        ↓
❌ [LAYER 1: LOCAL]
   └─ Pre-commit hook runs: npm run lint
   └─ Blocks commit if lint fails
        ↓
✅ COMMIT SUCCEEDS
        ↓
   Developer pushes to feature branch
        ↓
❌ [LAYER 2: CI/CD]
   └─ GitHub Actions runs on every PR to main:
      ├─ TypeScript type-check
      ├─ ESLint (0 warnings)
      ├─ Unit tests + coverage
      ├─ E2E smoke tests (Playwright)
      ├─ Integration tests (PostgreSQL)
      ├─ i18n parity check (ES/EN/PT-BR)
      └─ Documentation validation
   └─ Blocks merge if ANY check fails
        ↓
✅ ALL CHECKS PASS
        ↓
   PR review + approval
        ↓
❌ [LAYER 3: REVIEW]
   └─ CODEOWNERS validation
   └─ Branch protection rules enforce:
      ├─ Minimum 1 approval
      ├─ Status checks passed
      └─ No force-push
        ↓
✅ MERGE TO MAIN
```

---

## 🔧 LAYER 1: LOCAL — Pre-commit Hooks

### How It Works

**Before each commit**, Husky + lint-staged run automatically:

```bash
$ git commit -m "feat: new feature"

husky - pre-commit hook triggered
↓
npx lint-staged
├─ Run ESLint --fix on changed *.{ts,tsx}
└─ If any file fails → commit BLOCKED
npm run type-check
└─ TypeScript project check (tsc --noEmit) → commit BLOCKED if it fails
```

### Configuration

**File:** `.husky/pre-commit`
```bash
#!/bin/sh
. "$(dirname "$0")/_/husky.sh"

npx lint-staged
npm run type-check
```

**File:** `package.json`
```json
{
  "lint-staged": {
    "*.{ts,tsx}": [
      "eslint --fix --max-warnings 0"
    ]
  }
}
```

### What Gets Checked

| Check | Tool | Rule | Blocks Commit? |
|-------|------|------|---|
| Code style | ESLint | jsx-a11y + TypeScript | ✅ YES |
| Formatting | ESLint | Consistent indentation | ✅ YES |
| Unused imports | ESLint | Remove unused | ✅ YES |
| Accessibility | jsx-a11y | WCAG 2.1 AA compliance | ✅ YES |

### Developer Experience

**Scenario 1: Code passes lint**
```bash
$ git commit -m "feat: add button component"

husky - pre-commit hook
lint-staged: checked 1 file
✅ Success — commit allowed
```

**Scenario 2: Code fails lint**
```bash
$ git commit -m "feat: unused variable in component"

husky - pre-commit hook
lint-staged: checked 1 file
❌ ESLint error: 'foo' is defined but never used (no-unused-vars)
✖ Fix the error and try again

$ npm run lint:fix  # Auto-fix where possible
$ git add src/pages/MyComponent.tsx
$ git commit -m "feat: add button component"
✅ Success — commit allowed
```

---

## 🔐 LAYER 2: CI/CD — GitHub Actions

### Workflows

**Primary:** `.github/workflows/ci.yml` (runs on every PR to main)

**Specialized validators** (run on specific path changes):
- `.github/workflows/backend-validation.yml` → On `server/**` changes
- `.github/workflows/frontend-validation.yml` → On `src/**` changes
- `.github/workflows/devops-validation.yml` → On `Dockerfile`, docker-compose changes
- `.github/workflows/infrastructure-validation.yml` → On `terraform/**` changes
- `.github/workflows/qa-validation.yml` → On test changes

### Main CI Checks

| Check | Command | Purpose | Blocks Merge? |
|-------|---------|---------|---|
| Type-check | `npm run type-check` | Catch type errors | ✅ YES |
| Lint | `npm run lint` | Code style | ✅ YES |
| Unit tests | `npm run test:coverage` | Logic validation | ✅ YES |
| E2E tests | `npm run test:e2e` | Critical paths | ✅ YES |
| Integration tests | `npm run test:integration` | Database interactions | ✅ YES |
| i18n parity | `npm run check:i18n` | ES/EN/PT-BR sync | ✅ YES |
| Docs validation | `npm run check:docs-map` | Documentation sync | ✅ YES |
| SBOM generation | `npm run sbom:generate` | Dependency audit | ✅ YES |

### Branch Protection Rules (Required)

In GitHub repository settings → Branches → main:

```
✅ Require a pull request before merging
   ├─ Require code reviews before merging
   │  └─ Required number of approvals: 1
   │
   ├─ Require status checks to pass before merging
   │  └─ Require branches to be up to date before merging
   │  └─ Status checks:
   │     ├─ Quality Gate (ci.yml)
   │     ├─ backend-validation (if backend changed)
   │     └─ frontend-validation (if frontend changed)
   │
   ├─ Dismiss stale pull request approvals when new commits are pushed
   │
   ├─ Require conversation resolution before merging
   │
   └─ Include administrators (enforce even on admins)
```

### Example PR Flow

```
Developer pushes feature branch
        ↓
GitHub triggers CI workflow
        ↓
All jobs run in parallel:
├─ Type-check ✅
├─ Lint ✅
├─ Unit tests ✅
├─ E2E tests ✅
├─ Integration tests ✅
├─ i18n check ✅
└─ Docs check ✅
        ↓
✅ All checks PASS
        ↓
PR shows "All checks passed"
Developer can request review
        ↓
Reviewer approves PR
        ↓
"Merge pull request" button enabled
        ↓
Code merged to main
```

---

## 📋 LAYER 3: PROCESS — Definition of Ready

### Issue Template

**File:** `.github/ISSUE_TEMPLATE/dor-acceptance-criteria.md`

Every issue MUST include:

1. **Criterion of Acceptance:**
   ```markdown
   - [ ] [Command/Path] validates the solution
   - [ ] `npm run lint` passes without warnings
   - [ ] `npm run type-check` passes without errors
   ```

2. **Area Identification:**
   - `area: backend`
   - `area: frontend`
   - `area: devops`
   - `area: infrastructure`
   - `area: qa`
   - `area: iso-documentation`
   - `area: cybersecurity`

3. **Priority:**
   - `priority: p0` — Blocker
   - `priority: p1` — Next sprint
   - `priority: p2` — Post-MVP

### DoR Review Checklist

Before starting implementation:

- [ ] Issue has verifiable acceptance criterion
- [ ] Criterion links to a command (`npm run X`) or path
- [ ] No hidden dependencies with fiscal modules
- [ ] i18n impact identified (if UI change)
- [ ] Area and priority assigned
- [ ] Linked to relevant ADR or documentation

---

## 🔑 CODEOWNERS

**File:** `.github/CODEOWNERS`

Automatically requests review from responsible owner:

```
# Global fallback
* @ayelenleclerc

# Backend
/server/ @ayelenleclerc
/tests/server/ @ayelenleclerc

# Frontend
/src/pages/ @ayelenleclerc
/src/components/ @ayelenleclerc

# Infrastructure
/terraform/ @ayelenleclerc
/.github/workflows/ @ayelenleclerc
```

### How It Works

```
Developer opens PR with changes to /src/components/Button.tsx
        ↓
GitHub bot checks CODEOWNERS
        ↓
Sees: /src/components/ @ayelenleclerc
        ↓
Automatically requests review from @ayelenleclerc
        ↓
PR blocks merge until reviewer approves
```

---

## ✅ Definition of Done (DoD)

Every merged commit MUST satisfy:

```
✅ Automated checks passed
   ├─ npm run lint (0 warnings)
   ├─ npm run type-check (no errors)
   ├─ npm run test (all pass)
   └─ npm run test:e2e (critical paths pass)

✅ Changes documented
   ├─ If API: updated docs/api/openapi.yaml
   ├─ If UI: updated src/locales/{es,en,pt-BR}/*.json
   ├─ If database: created Prisma migration
   └─ If major change: updated ADR or documentation

✅ Code reviewed
   ├─ CODEOWNERS approved
   ├─ At least 1 approval
   └─ All conversations resolved

✅ Standards met
   ├─ Follows .cursor/rules/* standards
   ├─ Matches architectural patterns
   └─ No anti-patterns introduced
```

---

## 📊 Metrics & Monitoring

### Coverage Targets

| Area | Target | Current | Status |
|------|--------|---------|--------|
| Unit tests | ≥80% | TBD | 🔄 |
| Integration tests | ≥75% | TBD | 🔄 |
| E2E critical paths | ≥6 tests | 1 smoke test | 🔴 Needs work |
| Type coverage | 100% | 99.5% | 🟢 |
| Lint violations | 0 warnings | 0 | 🟢 |
| i18n parity | 100% | 100% | 🟢 |

### GitHub Actions Dashboard

Monitor workflows at: `https://github.com/ayelenleclerc/BizCode/actions`

View by:
- Latest runs (all workflows)
- Workflow-specific (e.g., only `ci.yml`)
- Status filters (success/failure)

### Failure Diagnosis

**If a check fails:**

1. **Local reproduction:**
   ```bash
   npm run lint          # Lint errors
   npm run type-check    # Type errors
   npm run test          # Unit test failures
   npm run test:e2e      # E2E failures
   npm run test:integration  # Integration failures
   ```

2. **Fix the issue locally:**
   ```bash
   npm run lint:fix      # Auto-fix lint issues
   # Manual fixes for types/tests
   ```

3. **Re-commit and push:**
   ```bash
   git add .
   git commit -m "fix: address lint violations"
   git push origin feature/my-feature
   ```

4. **CI re-runs automatically** on new push

---

## 🎓 Team Responsibilities

### Developers
- ✅ Run `npm run lint`, `npm run type-check` before committing
- ✅ Update i18n files (ES/EN/PT-BR) for UI changes
- ✅ Write tests for new features
- ✅ Fill out issue template with DoR checklist

### Code Owners
- ✅ Review PRs assigned to them
- ✅ Verify DoD checklist before approving
- ✅ Ensure code follows standards

### DevOps / Maintainer
- ✅ Monitor CI/CD health
- ✅ Update branch protection rules as needed
- ✅ Keep GitHub Actions workflows current

---

## 🚀 Summary: From Code to Production

```
1. [LOCAL] Developer writes code
   └─ Pre-commit: npm run lint validates
   └─ If fails → cannot commit

2. [LOCAL] Code meets standards
   └─ Developer: git commit ✅
   └─ Developer: git push ✅

3. [CI/CD] GitHub Actions validates
   └─ Type-check ✅
   └─ Lint ✅
   └─ Tests ✅
   └─ E2E ✅
   └─ If any fails → PR blocks

4. [REVIEW] Code owner approves
   └─ CODEOWNERS requests review
   └─ Reviewer checks DoD
   └─ If OK → approves ✅

5. [MERGE] Branch protection validates
   └─ All checks passed ✅
   └─ Reviewed & approved ✅
   └─ Merge button available ✅

6. [DEPLOY] Code reaches main
   └─ Production-ready ✅
```

---

## 📚 Related Documents

- [Definition of Ready (DoR) & Done (DoD)](master-plan-bizcode-execution.md#governance-package)
- [Backend Standards](../../.cursor/rules/backend-standards.mdc)
- [Frontend Standards](../../.cursor/rules/frontend-standards.mdc)
- [DevOps Standards](../../.cursor/rules/devops-standards.mdc)
- [CI/CD Documentation](ci-cd.md)
- [Testing Strategy](testing-strategy.md)

---

**This system ensures that EVERY commit to main has been validated by:**
- ✅ Automated lint + type checks (local + CI)
- ✅ Unit + integration + E2E tests
- ✅ Human code review by domain expert
- ✅ Governance checklist (DoR + DoD)

**Result:** Production-ready code, every time.
