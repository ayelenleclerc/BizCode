# GitHub Phase 1 Setup (Blueprint)

This repository includes automated assets for the Phase 1 governance blueprint.

## Included assets

- Labels source: `.github/labels.json`
- Label sync workflow: `.github/workflows/sync-labels.yml`
- PR status to Project automation: `.github/workflows/project-status-automation.yml`
- Cursor plan contract validation in CI: `.github/workflows/plan-md-validate.yml` (`npm run plan:validate`)
- Issue template: `.github/ISSUE_TEMPLATE/task.yml`
- PR template: `.github/pull_request_template.md`
- Bootstrap script: `scripts/github/setup-phase1.ps1`

## One-time setup steps

1. Authenticate GH CLI:
   - `gh auth login`
2. Run bootstrap script from repo root:
   - `powershell -ExecutionPolicy Bypass -File scripts/github/setup-phase1.ps1`
3. In GitHub Project V2, create and configure fields:
   - Status: `Backlog`, `Ready`, `In Progress`, `Blocked`, `Done`
   - Priority: `P0`, `P1`, `P2`
   - Type: `feature`, `bug`, `security`, `docs`, `chore`, `tech-debt`
   - Area: `iam`, `sales`, `billing`, `inventory`, `orders`, `logistics`, `finance`, `platform`, `quality`, `iso`
   - Mode: `local`, `saas`, `both`
   - Sprint: text
   - Risk: `low`, `medium`, `high`
   - Effort: `XS`, `S`, `M`, `L`, `XL`
   - Dependencies: text
   - ISO Evidence: text
4. Set repository variables used by project status automation:
   - `PROJECT_V2_ID`
   - `PROJECT_STATUS_FIELD_ID`
   - `PROJECT_STATUS_OPTION_BACKLOG`
   - `PROJECT_STATUS_OPTION_IN_PROGRESS`
   - `PROJECT_STATUS_OPTION_DONE`
   - `PROJECT_STATUS_OPTION_BLOCKED` (optional)
5. (Recommended for user-owned Projects) add repository secret:
   - `PROJECT_AUTOMATION_TOKEN` = GitHub PAT with scopes:
     - `repo`
     - `project`
     - `read:project`

## Cursor plan → GitHub (`plan:sync`)

After labels and project variables exist, you can sync a Cursor `.plan.md` file to Issues and Project v2:

```bash
npm run plan:sync -- --plan path/to/your.plan.md
```

Dry run (no API calls):

```bash
npm run plan:sync -- --plan path/to/your.plan.md --dry-run
```

Validate plan fixtures locally (no token; same checks as CI):

```bash
npm run plan:validate
```

Required env for a live sync: `GH_TOKEN` or `GITHUB_TOKEN`, `GITHUB_REPOSITORY` (or `GITHUB_OWNER` + `GITHUB_REPO`, or `plan:sync --repo owner/repo`), plus the same `PROJECT_*` variables as the project automation workflow. Sync state lives under `.github/plan-sync/state/`; reports under `.github/plan-sync/reports/` are gitignored. User documentation (three locales) is under `docs/*/quality/` — see [DOCUMENT_LOCALE_MAP.md](../docs/DOCUMENT_LOCALE_MAP.md) (row *Cursor plan → GitHub*).

## Notes

- Project status automation only runs when all required variables are present.
- For user-owned Project V2 boards, default `GITHUB_TOKEN` can fail to read/update issue project items.
  Use `PROJECT_AUTOMATION_TOKEN` secret to ensure reliable status transitions.
- Branch protection step in the script expects CI check named `Quality Gate`.
- On GitHub Free private repositories, branch protection/rulesets can be unavailable. In that case, upgrade plan or make repository public to enforce required checks at merge time.
