import path from 'node:path'
import type { PlanDocument, PlanTodo } from '../../../src/lib/plan-sync'
import { allLabelsForTodo, todoContentHash } from './parse'
import type { PlanSyncStateFile, SyncStateTodo } from './types'
import {
  getToken,
  gqlAddProjectItem,
  gqlFindProjectItem,
  gqlUpdateProjectItemStatus,
  optionalEnv,
  parseRepoRef,
  requireEnv,
  restComment,
  restCreateIssue,
  restGetIssue,
  restUpdateIssue,
} from './github'
import { loadState, saveState, writeReport } from './state'

export type SyncOptions = {
  repoRoot: string
  planPath: string
  planSlug: string
  doc: PlanDocument
  bodyMarkdown: string
  planHash: string
  dryRun: boolean
}

function issueTitle(planName: string, todo: PlanTodo): string {
  return `[PLAN:${planName}] ${todo.content}`
}

function issueBody(args: {
  planName: string
  planPath: string
  overview: string
  todo: PlanTodo
  bodySnippet: string
}): string {
  const marker = `<!-- plan-sync:todo-id:${args.todo.id} -->`
  const lines = [
    marker,
    '',
    `## Plan`,
    `- **Plan name:** ${args.planName}`,
    `- **Todo id:** \`${args.todo.id}\``,
    `- **Source path:** \`${args.planPath}\``,
    '',
    '## Overview',
    args.overview || '_—_',
    '',
    '## Scope',
    `_Derived from plan todo. Refine in issue comments if needed._`,
    '',
    '## Acceptance criteria (initial)',
    `- [ ] Deliverable matches plan todo \`${args.todo.id}\``,
    '- [ ] Quality gate passes for linked PRs',
    '',
    '## Test plan (initial)',
    '- [ ] `npm run lint`',
    '- [ ] `npm run type-check`',
    '- [ ] `npm run test`',
    '',
    '## Documentation impact',
    '- [ ] docs/es update required (if behavior/docs change)',
    '- [ ] docs/en update required',
    '- [ ] docs/pt-br update required',
    '- [ ] OpenAPI update required (`docs/api/openapi.yaml`) if HTTP contract changes',
    '- [ ] `npm run docs:generate` if generated artifacts drift',
    '',
    '## ISO evidence target',
    '_TBD — link controlled docs/records when the task touches compliance evidence._',
    '',
    '## Plan excerpt',
    '```md',
    args.bodySnippet.slice(0, 4000),
    args.bodySnippet.length > 4000 ? '\n... (truncated)' : '',
    '```',
    '',
  ]
  return lines.join('\n')
}

function statusOptionForTodo(todo: PlanTodo): string {
  const backlog = requireEnv('PROJECT_STATUS_OPTION_BACKLOG')
  const inProgress = requireEnv('PROJECT_STATUS_OPTION_IN_PROGRESS')
  const done = requireEnv('PROJECT_STATUS_OPTION_DONE')
  switch (todo.status) {
    case 'pending':
      return backlog
    case 'in_progress':
      return inProgress
    case 'completed':
      return done
    case 'cancelled':
      return backlog
    default:
      return backlog
  }
}

function stripSnippet(body: string): string {
  const t = body.trim()
  if (!t) {
    return '_No markdown body after frontmatter._'
  }
  return t.slice(0, 800)
}

export type SyncResult = {
  created: number
  updated: number
  unchanged: number
  failed: number
  orphanHandled: number
  projectLinkFailures: number
  syncDurationMs: number
  lines: string[]
}

export async function syncPlanToGitHub(opts: SyncOptions): Promise<SyncResult> {
  const t0 = performance.now()
  const ref = parseRepoRef()

  const projectId = opts.dryRun ? '' : requireEnv('PROJECT_V2_ID')
  const statusFieldId = opts.dryRun ? '' : requireEnv('PROJECT_STATUS_FIELD_ID')

  const result: SyncResult = {
    created: 0,
    updated: 0,
    unchanged: 0,
    failed: 0,
    orphanHandled: 0,
    projectLinkFailures: 0,
    syncDurationMs: 0,
    lines: [],
  }

  const prev = loadState(opts.repoRoot, opts.planSlug)
  const prevById = new Map((prev?.todos ?? []).map((t) => [t.id, t] as const))
  const currentIds = new Set(opts.doc.todos.map((t) => t.id))

  if (!opts.dryRun) {
    getToken()
    requireEnv('PROJECT_STATUS_OPTION_BACKLOG')
    requireEnv('PROJECT_STATUS_OPTION_IN_PROGRESS')
    requireEnv('PROJECT_STATUS_OPTION_DONE')
    optionalEnv('PROJECT_STATUS_OPTION_BLOCKED')
  }

  const now = new Date().toISOString()
  const nextById = new Map<string, SyncStateTodo>(prevById)

  for (const todo of opts.doc.todos) {
    const labels = allLabelsForTodo(todo, opts.bodyMarkdown)
    const title = issueTitle(opts.doc.name, todo)
    const contentHash = todoContentHash(todo)
    const snippet = stripSnippet(opts.bodyMarkdown)
    const body = issueBody({
      planName: opts.doc.name,
      planPath: opts.planPath,
      overview: opts.doc.overview,
      todo,
      bodySnippet: snippet,
    })

    if (opts.dryRun) {
      result.lines.push(`dry-run: would upsert todo=${todo.id} labels=${labels.join(',')}`)
      continue
    }

    try {
      const existing = prevById.get(todo.id)
      let issueNumber: number
      let nodeId: string
      const projectItemId: string | undefined = existing?.projectItemId

      if (existing?.issueNumber) {
        const current = await restGetIssue({
          owner: ref.owner,
          repo: ref.repo,
          issueNumber: existing.issueNumber,
        })
        const needsUpdate =
          current.title !== title || (current.body ?? '') !== body || contentHash !== existing.lastContentHash
        if (needsUpdate) {
          const updated = await restUpdateIssue({
            owner: ref.owner,
            repo: ref.repo,
            issueNumber: existing.issueNumber,
            title,
            body,
            labels,
          })
          issueNumber = updated.number
          nodeId = updated.node_id
          result.updated += 1
          result.lines.push(`updated issue #${issueNumber} todo=${todo.id}`)
        } else {
          issueNumber = current.number
          nodeId = current.node_id
          result.unchanged += 1
          result.lines.push(`unchanged issue #${issueNumber} todo=${todo.id}`)
        }
      } else {
        const created = await restCreateIssue({
          owner: ref.owner,
          repo: ref.repo,
          title,
          body,
          labels,
        })
        issueNumber = created.number
        nodeId = created.node_id
        result.created += 1
        result.lines.push(`created issue #${issueNumber} todo=${todo.id}`)
      }

      let itemId: string | undefined = projectItemId
      try {
        if (!itemId) {
          itemId = await gqlFindProjectItem({
            projectId,
            issueNumber,
            owner: ref.owner,
            repo: ref.repo,
          })
        }
        if (!itemId) {
          itemId = await gqlAddProjectItem({ projectId, contentNodeId: nodeId })
          result.lines.push(`added project item ${itemId} for #${issueNumber}`)
        }

        const optionId = statusOptionForTodo(todo)
        await gqlUpdateProjectItemStatus({
          projectId,
          itemId,
          fieldId: statusFieldId,
          optionId,
        })
        result.lines.push(`set project status for #${issueNumber} todo=${todo.status}`)

        if (todo.status === 'cancelled') {
          await restComment({
            owner: ref.owner,
            repo: ref.repo,
            issueNumber,
            body:
              '`cancelled-by-plan-sync`: This todo was marked cancelled in the plan. Status set to Backlog; label `type:chore` applied per policy.',
          })
        }

        nextById.set(todo.id, {
          id: todo.id,
          issueNumber,
          issueNodeId: nodeId,
          projectItemId: itemId,
          lastContentHash: contentHash,
        })
      } catch (projErr: unknown) {
        result.projectLinkFailures += 1
        const pmsg = projErr instanceof Error ? projErr.message : String(projErr)
        result.lines.push(`PROJECT_LINK_FAILED todo=${todo.id}: ${pmsg}`)
        await restComment({
          owner: ref.owner,
          repo: ref.repo,
          issueNumber,
          body: `\`plan-sync\`: Failed to link or update GitHub Project v2 for this issue.\n\nError: ${pmsg}\n\nRe-run \`plan:sync\` to retry. Label \`needs-spec\` applied per policy.`,
        })
        const recoveryLabels = [...new Set([...labels, 'needs-spec'])]
        await restUpdateIssue({
          owner: ref.owner,
          repo: ref.repo,
          issueNumber,
          title,
          body,
          labels: recoveryLabels,
        })
        result.lines.push(`applied needs-spec + comment on #${issueNumber} todo=${todo.id}`)
        nextById.set(todo.id, {
          id: todo.id,
          issueNumber,
          issueNodeId: nodeId,
          projectItemId: itemId,
          lastContentHash: contentHash,
        })
      }
    } catch (err: unknown) {
      result.failed += 1
      const msg = err instanceof Error ? err.message : String(err)
      result.lines.push(`FAILED todo=${todo.id}: ${msg}`)
    }
  }

  for (const st of prev?.todos ?? []) {
    if (currentIds.has(st.id)) {
      continue
    }
    if (opts.dryRun) {
      result.lines.push(`dry-run: would handle orphan todo=${st.id} issue=#${st.issueNumber}`)
      continue
    }
    try {
      const current = await restGetIssue({
        owner: ref.owner,
        repo: ref.repo,
        issueNumber: st.issueNumber,
      })
      await restComment({
        owner: ref.owner,
        repo: ref.repo,
        issueNumber: st.issueNumber,
        body:
          '`cancelled-by-plan-sync`: This todo was removed from the plan file. Per policy the issue is kept; label `type:chore` merged and Project status reset to Backlog.',
      })
      const prior = (current.labels ?? []).map((l) => l.name)
      const merged = [...new Set([...prior, 'type:chore'])]
      await restUpdateIssue({
        owner: ref.owner,
        repo: ref.repo,
        issueNumber: st.issueNumber,
        title: current.title,
        body: current.body ?? '',
        labels: merged,
      })
      const itemId =
        st.projectItemId ??
        (await gqlFindProjectItem({
          projectId,
          issueNumber: st.issueNumber,
          owner: ref.owner,
          repo: ref.repo,
        }))
      if (itemId) {
        await gqlUpdateProjectItemStatus({
          projectId,
          itemId,
          fieldId: statusFieldId,
          optionId: requireEnv('PROJECT_STATUS_OPTION_BACKLOG'),
        })
      }
      result.orphanHandled += 1
      result.lines.push(`orphan handled issue=#${st.issueNumber} todo=${st.id}`)
      nextById.delete(st.id)
    } catch (err: unknown) {
      result.failed += 1
      const msg = err instanceof Error ? err.message : String(err)
      result.lines.push(`FAILED orphan todo=${st.id}: ${msg}`)
    }
  }

  const finalTodos: SyncStateTodo[] = []
  for (const todo of opts.doc.todos) {
    const row = nextById.get(todo.id)
    if (row) {
      finalTodos.push(row)
    }
  }

  if (!opts.dryRun) {
    const state: PlanSyncStateFile = {
      planSlug: opts.planSlug,
      planPath: opts.planPath,
      planHash: opts.planHash,
      syncedAt: now,
      todos: finalTodos,
    }
    saveState(opts.repoRoot, state)
  }

  result.syncDurationMs = Math.round(performance.now() - t0)

  const reportMd = [
    '# plan:sync report',
    '',
    `- **planSlug:** ${opts.planSlug}`,
    `- **planPath:** ${opts.planPath}`,
    `- **dryRun:** ${opts.dryRun}`,
    `- **syncDurationMs:** ${result.syncDurationMs}`,
    `- **created:** ${result.created}`,
    `- **updated:** ${result.updated}`,
    `- **unchanged:** ${result.unchanged}`,
    `- **failed:** ${result.failed}`,
    `- **projectLinkFailures:** ${result.projectLinkFailures}`,
    `- **orphanHandled:** ${result.orphanHandled}`,
    '',
    '## Log',
    '',
    ...result.lines.map((l) => `- ${l}`),
    '',
  ].join('\n')

  if (!opts.dryRun) {
    writeReport(opts.repoRoot, opts.planSlug, reportMd)
  }

  return result
}

export function resolveRepoRoot(explicit?: string): string {
  if (explicit?.trim()) {
    return path.resolve(explicit.trim())
  }
  return path.resolve(process.cwd())
}
