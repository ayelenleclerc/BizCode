# Cursor plan approval/archive + GitHub sync (`plan:approve`, `plan:sync`)

## Purpose

The `npm run plan:approve` command is the operator entrypoint to process an approved Cursor-style Markdown plan (YAML frontmatter between `---` delimiters plus body). It first archives an immutable copy to `.cursor/plans/{timestamp}-{slug}.plan.md`, then runs the same sync behavior as `npm run plan:sync`: validates todos/labels against `.github/labels.json`, and **creates or updates GitHub Issues** titled `[PLAN:{planName}] …`. It adds each issue to **GitHub Project v2** (when configured) and sets the **Status** field from each todo’s `status`:

- `pending` → Backlog
- `in_progress` → In Progress
- `completed` → Done
- `cancelled` → Backlog + `type:chore` + explanatory comment

Todos removed from the plan but still present in the last run’s state file are treated as **orphans**: the issue is kept, a comment is added, labels are set to `type:chore`, `priority:P2`, `area:platform` (must exist in `.github/labels.json`), and Status returns to Backlog when the project item exists.

**Completed todos (`status: completed`):** the sync creates or updates the issue the same way as other statuses and sets Project **Status** to **Done** (retroactive backfill when a todo was already done before the first sync).

## Plan contract

See TypeScript schemas in `scripts/github/plan-sync/types.ts`: required frontmatter fields `name`, `overview`, `todos[]` with `id`, `content`, `status` (`pending` \| `in_progress` \| `completed` \| `cancelled`), optional `meta` (`type`, `priority`, `area`) with defaults `feature`, `P1`, `platform`.

## Heuristic labels

If the todo text or plan body matches simple keywords, extra labels are added (and must exist in `.github/labels.json`): **`needs-docs`** (e.g. documentation, OpenAPI, i18n), **`needs-tests`** (e.g. test, coverage, Vitest, Playwright).

## Project link failures

The catalog **must** include **`needs-spec`** (used for recovery). If linking to Project v2 or updating Status fails after the issue exists, the tool comments on the issue, applies **`needs-spec`** (merged with current labels), persists **`projectItemId` when it was already resolved**, and **exits with code 1** so the run is visible; the next `plan:sync` retries Project operations.

## Prerequisites

- One-time Phase 1 setup: see [`.github/PROJECT_SETUP_PHASE1.md`](../../../.github/PROJECT_SETUP_PHASE1.md) (labels, project fields, repository variables).
- Label names used by the sync are derived from each todo’s `meta` (defaults: `type:feature`, `priority:P1`, `area:platform`), optional heuristics, and recovery **`needs-spec`**; all must exist in [`.github/labels.json`](../../../.github/labels.json).

## Usage

From the repository root:

```bash
npm run plan:approve -- --plan path/to/plan.plan.md
```

```bash
npm run plan:sync -- --plan path/to/plan.plan.md
```

Options:

- `--repo-root <dir>` — repository root (defaults to current working directory).
- `--dry-run` — parse and log intended actions; **no** GitHub API calls and **no** state/report writes.
- `--archive-dir <dir>` — only for `plan:approve`; relative directory used for archive copies (defaults to `.cursor/plans`).

## Build button hook

No repository-level hook to Cursor's **Build** button is implemented in this codebase. **Not evidenced in current codebase**.
Use `npm run plan:approve -- --plan ...` as the explicit approval/archive workflow.

## Environment variables

- `GH_TOKEN` or `GITHUB_TOKEN` (required): PAT with `repo` and project scopes as needed.
- `GITHUB_REPOSITORY` (required*): `owner/repo`.
- `GITHUB_OWNER` + `GITHUB_REPO` (required*): alternative to `GITHUB_REPOSITORY`.
- `PROJECT_V2_ID` (required): Project node id.
- `PROJECT_STATUS_FIELD_ID` (required): single-select Status field id.
- `PROJECT_STATUS_OPTION_BACKLOG` (required): option id for Backlog.
- `PROJECT_STATUS_OPTION_IN_PROGRESS` (required): option id for In Progress.
- `PROJECT_STATUS_OPTION_DONE` (required): option id for Done.
- `PROJECT_STATUS_OPTION_BLOCKED` (optional): reserved for future use.

## Persistent artifacts (repository)

After a successful non–dry-run sync:

- **State:** `.github/plan-sync/state/{slug}.json` — maps todo `id` → `issueNumber`, content hash, optional `projectItemId` (idempotent reruns; omitted until Project link succeeds).
- **Reports:** `.github/plan-sync/reports/{timestamp}-{slug}.md` — human-readable log including **`syncDurationMs`** and **`projectLinkFailures`** counts.

Commit these files if the team wants shared sync state; otherwise treat as local (not documented as ignored by default).

## Related

- [Generated documentation](generated-documentation.md) — docs generation policy.
- [CI/CD](ci-cd.md) — pipeline does not run `plan:sync` by default; it is an operator workflow.
