# Contributing to BizCode

## Project rules (mandatory)

Before opening or updating a PR, read and comply with:

- [`.cursor/rules/bizcode.mdc`](.cursor/rules/bizcode.mdc) — always-on rules (documentation in three locales, trilingual comments where required, accessibility, tests, no speculation).
- [`.cursor/rules/bizcode-documentation.mdc`](.cursor/rules/bizcode-documentation.mdc) — when editing files under `docs/`.
- **ISO controlled stubs:** the closed catalog (GOV…PROC-MAN) is driven by [scripts/iso-doc-registry.mjs](scripts/iso-doc-registry.mjs). Regenerate all trilingual stubs after registry edits with `npm run docs:generate-iso-stubs`, then update [docs/DOCUMENT_LOCALE_MAP.md](docs/DOCUMENT_LOCALE_MAP.md) (use `scripts/emit-full-locale-map-rows.mjs` as a helper) and the three [iso-package-index](docs/en/certificacion-iso/iso-package-index.md) files; see [`.cursor/rules/certificacion-iso.mdc`](.cursor/rules/certificacion-iso.mdc).

See also [AGENTS.md](AGENTS.md) for the short index.

## Node.js and dependencies

- **Node.js:** use **22 LTS** locally (see [`.nvmrc`](.nvmrc)). The minimum version is declared in [`package.json`](package.json) under `engines`.
- **Install:** run `npm ci` after cloning (respects [`.npmrc`](.npmrc) `legacy-peer-deps`, required for `eslint-plugin-jsx-a11y` with ESLint 10 until upstream peers align).
- **Lockfile:** commit `package-lock.json` with every dependency change; bump packages in focused steps and run the quality gate locally.

### Windows: PowerShell and `npm`

If `npm run …` fails with **script execution disabled** / `npm.ps1` / `PSSecurityException`, the `package.json` scripts are fine: **PowerShell is blocking the `npm` shim**, not your project.

- **Recommended:** use **Command Prompt** or **Git Bash** for the integrated terminal. This repo sets the default on Windows to Command Prompt via [`.vscode/settings.json`](.vscode/settings.json) (and [BizCode.code-workspace](BizCode.code-workspace) when you open the workspace).
- **Alternatives:** run `npm.cmd run dev:full`, or allow scripts for your user: `Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser` (PowerShell).

## Branch Workflow

### Application code

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

### Published documentation (`documentacion`)

The **orphan** branch `documentacion` contains **no application source** — only files copied from `main` for static hosting (e.g. GitHub Pages).

- **Automation:** GitHub Actions **`.github/workflows/sync-documentacion.yml`** runs on pushes to **`main`** when `docs/**`, `Certificación-ISO/**`, or root `README.md`, `AGENTS.md`, or `CONTRIBUTING.md` change. It replaces the tip of `documentacion` with a snapshot of those paths. **Manual run:** Actions → *Sync documentacion branch* → *Run workflow* (optional `source_ref`, default `main`).
- **Policy:** You still author and review documentation in normal branches; the workflow publishes **after** changes reach `main`. It does **not** merge code into `documentacion`.
- **Details:** [docs/en/quality/ci-cd.md](docs/en/quality/ci-cd.md) · [es](docs/es/quality/ciclo-ci-cd.md) · [pt-BR](docs/pt-br/quality/ciclo-ci-cd.md) (section *Documentation branch* / *Rama huérfana* / *Branch huérfã*).

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
- [ ] Coverage thresholds met: **100%** en `src/lib/**`, `server/createApp.ts` y `server.ts` (véase `vitest.config.ts` y [testing-strategy](docs/en/quality/testing-strategy.md)); ampliar alcance solo con **ADR** explícito
- [ ] New user-visible strings use `t()` — no hardcoded text in components
- [ ] `npm run check:i18n` passes (en and pt-BR keys are in sync with es)
- [ ] API contract tests pass (`tests/api/contract.test.ts`) and OpenAPI remains aligned with `server/createApp.ts` (see [docs/api/openapi.yaml](docs/api/openapi.yaml)); follow the trilingual Swagger/OpenAPI plan [en](docs/en/quality/swagger-openapi-ui-plan.md) · [es](docs/es/quality/plan-swagger-openapi-ui.md) · [pt-BR](docs/pt-br/quality/plano-swagger-openapi-ui.md) for UI tooling and agent policy
- [ ] **`npm run docs:generate`** run and outputs committed when the change affects generated docs (TypeScript surface, OpenAPI contract, or production dependency set for SBOM): no uncommitted drift under `docs/generated/`, `docs/api/openapi-reference.generated.md`, or `docs/evidence/sbom-cyclonedx.json` (see [en](docs/en/quality/generated-documentation.md) · [es](docs/es/quality/documentacion-generada.md) · [pt-BR](docs/pt-br/quality/documentacao-gerada.md))
- [ ] **Product vision / fiscal deployment:** if the PR changes fiscal logic by jurisdiction or deployment assumptions (desktop vs SaaS), update the trilingual [product vision](docs/en/quality/product-vision-and-deployment.md) or [ADR-0007](docs/en/adr/ADR-0007-dual-deployment-and-fiscal-modularity.md) as appropriate (same decisions in `docs/en/`, `docs/es/`, `docs/pt-br/`)
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
npm run docs:generate   # TypeDoc, OpenAPI MD, schema MD, SBOM — commit outputs; CI checks git diff
npm run test:e2e        # Playwright smoke (vite preview); see docs/en/adr/ADR-0004-e2e-playwright-integration-roadmap.md
npx prisma migrate deploy   # Apply schema (needed before integration tests)
npm run test:integration    # HTTP + real Prisma vs PostgreSQL; requires DATABASE_URL (e.g. .env)
```

All must exit 0 before opening a PR. If you do not run PostgreSQL locally, rely on CI for `test:integration`; contract + unit coverage do not require a database.

`npm run server` executes `tsx server/main.ts` (API bootstrap is in `server.ts`; see [ADR-0005](docs/en/adr/ADR-0005-vitest-coverage-server-bootstrap.md)). Optional release workflows: [ADR-0006](docs/en/adr/ADR-0006-release-and-tauri-ci-workflows.md).
