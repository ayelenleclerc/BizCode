# Contributing to BizCode

## Project rules (mandatory)

Before opening or updating a PR, read and comply with:

- [`.cursor/rules/bizcode.mdc`](.cursor/rules/bizcode.mdc) — always-on rules (documentation in three locales, trilingual comments where required, accessibility, tests, no speculation).
- [`.cursor/rules/bizcode-documentation.mdc`](.cursor/rules/bizcode-documentation.mdc) — when editing files under `docs/`.

See also [AGENTS.md](AGENTS.md) for the short index.

## Branch Workflow

```
main          ← stable, protected, CI must be green
  └── develop ← integration branch
        └── feature/short-description
        └── fix/short-description
        └── docs/short-description
```

- Branch from `develop`.
- Open a Pull Request targeting `develop`.
- `main` is updated via merge from `develop` after a release.
- Direct pushes to `main` are prohibited.

## Commit Convention

Use [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <short description>

[optional body]

[optional footer: Co-Authored-By, Closes #123]
```

**Types:** `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`, `ci`

**Examples:**

```
feat(clientes): add CUIT format validation on blur
fix(invoice): correct IVA 10.5% rounding for Monotributo
docs(adr): add ADR-0003 for state management decision
test(validators): cover remainder===0 branch in validateCUIT
```

## Definition of Done (DoD)

A task is **Done** only when ALL of the following are true:

- [ ] **Cursor / project rules:** changes respect [`.cursor/rules/bizcode.mdc`](.cursor/rules/bizcode.mdc); documentation edits respect [`.cursor/rules/bizcode-documentation.mdc`](.cursor/rules/bizcode-documentation.mdc) where applicable
- [ ] Code compiles without errors (`npm run type-check` → exit 0)
- [ ] No new ESLint errors (`npm run lint` → exit 0)
- [ ] All unit tests pass (`npm run test` → exit 0)
- [ ] Coverage thresholds met: **100%** en `src/lib/**` y `server/createApp.ts` (véase `vitest.config.ts` y [testing-strategy](docs/en/quality/testing-strategy.md)); ampliar alcance solo con **ADR** explícito
- [ ] New user-visible strings use `t()` — no hardcoded text in components
- [ ] `npm run check:i18n` passes (en and pt-BR keys are in sync with es)
- [ ] API contract tests pass (`tests/api/contract.test.ts`) and OpenAPI remains aligned with `server/createApp.ts` (see [docs/api/openapi.yaml](docs/api/openapi.yaml))
- [ ] Accessibility: dialogs have `role="dialog" aria-modal aria-labelledby`; inputs have `htmlFor`/`id` pairs; errors have `role="alert"`; required fields have `aria-required="true"`
- [ ] Primary action buttons have `data-testid` attributes
- [ ] CI pipeline is green on the PR branch
- [ ] At least one reviewer has approved (for non-trivial changes)
- [ ] `docs/en/changelog.md` (and matching `docs/es/`, `docs/pt-br/` entries) updated under `[Unreleased]` if the change is user-visible
- [ ] Documentation updated in **all three locales** (`docs/en/`, `docs/es/`, `docs/pt-br/`) when the change affects narrative docs — see [I18N_DOCUMENTATION.md](docs/I18N_DOCUMENTATION.md) and the canonical map [DOCUMENT_LOCALE_MAP.md](docs/DOCUMENT_LOCALE_MAP.md) (e.g. [theming](docs/en/theming.md); [architecture](docs/en/architecture.md)); if paths in the map or tree changed, `npm run check:docs-map` must pass

## Running the Quality Gate Locally

```bash
npm run type-check    # TypeScript
npm run lint          # ESLint
npm run test:coverage # Tests + coverage report
npm run check:i18n   # i18n parity
npm run check:docs-map  # DOCUMENT_LOCALE_MAP.md paths exist
npm run test:e2e        # Playwright smoke (vite preview); see docs/en/adr/ADR-0004-e2e-playwright-integration-roadmap.md
```

All must exit 0 before opening a PR.
