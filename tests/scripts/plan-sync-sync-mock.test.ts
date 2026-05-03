import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { parsePlanFile } from '../../scripts/github/plan-sync/parse'
import { syncPlanToGitHub } from '../../scripts/github/plan-sync/sync'

function writeFullLabels(root: string): void {
  const labels = [
    { name: 'type:feature' },
    { name: 'type:chore' },
    { name: 'priority:P1' },
    { name: 'priority:P2' },
    { name: 'area:platform' },
    { name: 'needs-spec' },
    { name: 'needs-docs' },
    { name: 'needs-tests' },
  ]
  mkdirSync(path.join(root, '.github'), { recursive: true })
  writeFileSync(path.join(root, '.github', 'labels.json'), JSON.stringify(labels), 'utf8')
}

describe('syncPlanToGitHub (mock fetch)', () => {
  let tmp: string
  let planFile: string

  beforeEach(() => {
    tmp = mkdtempSync(path.join(os.tmpdir(), 'bizcode-sync-'))
    writeFullLabels(tmp)
    planFile = path.join(tmp, 'p.plan.md')
    writeFileSync(
      planFile,
      `---
name: N
overview: O
todos:
  - id: t1
    content: Do work
    status: pending
---

body
`,
      'utf8',
    )
    process.env.GH_TOKEN = 'test-token'
    process.env.GITHUB_REPOSITORY = 'acme/repo'
    process.env.PROJECT_V2_ID = 'Pj_1'
    process.env.PROJECT_STATUS_FIELD_ID = 'Fld_1'
    process.env.PROJECT_STATUS_OPTION_BACKLOG = 'opt_b'
    process.env.PROJECT_STATUS_OPTION_IN_PROGRESS = 'opt_i'
    process.env.PROJECT_STATUS_OPTION_DONE = 'opt_d'
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    delete process.env.GH_TOKEN
    delete process.env.GITHUB_REPOSITORY
    delete process.env.PROJECT_V2_ID
    delete process.env.PROJECT_STATUS_FIELD_ID
    delete process.env.PROJECT_STATUS_OPTION_BACKLOG
    delete process.env.PROJECT_STATUS_OPTION_IN_PROGRESS
    delete process.env.PROJECT_STATUS_OPTION_DONE
    rmSync(tmp, { recursive: true, force: true })
  })

  it('creates issue and applies needs-spec when Project add fails', async () => {
    const patchBodies: unknown[] = []
    vi.stubGlobal(
      'fetch',
      vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
        const url = String(input)
        if (url.includes('/repos/acme/repo/issues') && init?.method === 'POST') {
          return new Response(
            JSON.stringify({
              id: 100,
              node_id: 'MD_1',
              number: 77,
              title: 'x',
              body: 'y',
            }),
            { status: 201, headers: { 'Content-Type': 'application/json' } },
          )
        }
        if (url.includes('/repos/acme/repo/issues/77/comments') && init?.method === 'POST') {
          return new Response(JSON.stringify({ id: 1 }), { status: 201 })
        }
        if (url.includes('/repos/acme/repo/issues/77') && init?.method === 'PATCH') {
          patchBodies.push(JSON.parse(init.body as string))
          return new Response(
            JSON.stringify({
              id: 100,
              node_id: 'MD_1',
              number: 77,
              title: 'x',
              body: 'y',
            }),
            { status: 200 },
          )
        }
        if (url.includes('api.github.com/graphql')) {
          const payload = JSON.parse(init?.body as string) as { query: string }
          if (payload.query.includes('addProjectV2ItemById')) {
            return new Response(
              JSON.stringify({ errors: [{ message: 'project add failed' }] }),
              { status: 200 },
            )
          }
          return new Response(
            JSON.stringify({
              data: {
                repository: {
                  issue: { projectItems: { nodes: [] } },
                },
              },
            }),
            { status: 200 },
          )
        }
        return new Response(`not mocked: ${url}`, { status: 500 })
      }),
    )

    const { doc, body, planHash } = parsePlanFile(planFile, { repoRoot: tmp })
    const result = await syncPlanToGitHub({
      repoRoot: tmp,
      planPath: 'p.plan.md',
      planSlug: 'p',
      doc,
      bodyMarkdown: body,
      planHash,
      dryRun: false,
    })

    expect(result.created).toBe(1)
    expect(result.projectLinkFailures).toBe(1)
    expect(result.failed).toBe(0)
    expect(result.syncDurationMs).toBeGreaterThanOrEqual(0)
    const patched = patchBodies[0] as { labels: string[] }
    expect(patched.labels).toContain('needs-spec')
    expect(patched.labels).toContain('type:feature')
  })

  it('backfills completed todo with Done project status', async () => {
    let statusOption: string | undefined
    writeFileSync(
      planFile,
      `---
name: N
overview: O
todos:
  - id: done1
    content: Shipped
    status: completed
---

x
`,
      'utf8',
    )

    vi.stubGlobal(
      'fetch',
      vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
        const url = String(input)
        if (url.includes('/repos/acme/repo/issues') && init?.method === 'POST') {
          return new Response(
            JSON.stringify({
              id: 101,
              node_id: 'MD_9',
              number: 99,
              title: 't',
              body: 'b',
            }),
            { status: 201 },
          )
        }
        if (url.includes('api.github.com/graphql')) {
          const payload = JSON.parse(init?.body as string) as {
            query: string
            variables?: { optionId?: string }
          }
          if (payload.query.includes('updateProjectV2ItemFieldValue')) {
            statusOption = payload.variables?.optionId
            return new Response(
              JSON.stringify({
                data: { updateProjectV2ItemFieldValue: { projectV2Item: { id: 'it' } } },
              }),
              { status: 200 },
            )
          }
          if (payload.query.includes('addProjectV2ItemById')) {
            return new Response(
              JSON.stringify({ data: { addProjectV2ItemById: { item: { id: 'it_new' } } } }),
              { status: 200 },
            )
          }
          return new Response(
            JSON.stringify({
              data: {
                repository: {
                  issue: { projectItems: { nodes: [] } },
                },
              },
            }),
            { status: 200 },
          )
        }
        return new Response(`not mocked: ${url}`, { status: 500 })
      }),
    )

    const { doc, body, planHash } = parsePlanFile(planFile, { repoRoot: tmp })
    const result = await syncPlanToGitHub({
      repoRoot: tmp,
      planPath: 'p.plan.md',
      planSlug: 'p',
      doc,
      bodyMarkdown: body,
      planHash,
      dryRun: false,
    })

    expect(result.created).toBe(1)
    expect(result.projectLinkFailures).toBe(0)
    expect(statusOption).toBe('opt_d')
  })
})
