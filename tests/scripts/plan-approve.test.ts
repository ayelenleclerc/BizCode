import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { approvePlanToGitHub, buildArchivePath } from '../../scripts/github/plan-approve'

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

describe('approvePlanToGitHub', () => {
  let tmp: string
  let planFile: string

  beforeEach(() => {
    tmp = mkdtempSync(path.join(os.tmpdir(), 'bizcode-approve-'))
    writeFullLabels(tmp)
    planFile = path.join(tmp, 'approved.plan.md')
    writeFileSync(
      planFile,
      `---
name: Approved plan
overview: Demo
todos:
  - id: t1
    content: Task one
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

  it('archives plan and then runs sync', async () => {
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
            { status: 201 },
          )
        }
        if (url.includes('api.github.com/graphql')) {
          const payload = JSON.parse(init?.body as string) as { query: string }
          if (payload.query.includes('addProjectV2ItemById')) {
            return new Response(
              JSON.stringify({ data: { addProjectV2ItemById: { item: { id: 'it_new' } } } }),
              { status: 200 },
            )
          }
          if (payload.query.includes('updateProjectV2ItemFieldValue')) {
            return new Response(
              JSON.stringify({
                data: { updateProjectV2ItemFieldValue: { projectV2Item: { id: 'it_new' } } },
              }),
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

    const result = await approvePlanToGitHub({
      plan: planFile,
      repoRoot: tmp,
      dryRun: false,
    })
    expect(result.syncResult.created).toBe(1)
    expect(existsSync(result.archivePath)).toBe(true)
    expect(readFileSync(result.archivePath, 'utf8')).toBe(readFileSync(planFile, 'utf8'))
  })

  it('does not write archive on dry-run', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => new Response('unused', { status: 500 })))
    const result = await approvePlanToGitHub({
      plan: planFile,
      repoRoot: tmp,
      dryRun: true,
    })
    expect(result.syncResult.created).toBe(0)
    expect(result.syncResult.lines[0]).toContain('dry-run')
    expect(existsSync(result.archivePath)).toBe(false)
  })
})

describe('buildArchivePath', () => {
  it('uses timestamp + slug + .plan.md convention', () => {
    const out = buildArchivePath({
      repoRoot: 'D:/repo',
      absPlanPath: 'D:/repo/my flow.plan.md',
      archiveDir: '.cursor/plans',
      now: new Date('2026-04-06T15:04:05.678Z'),
    })
    expect(out.replace(/\\/g, '/')).toContain('/.cursor/plans/2026-04-06T15-04-05-678Z-my_flow.plan.md')
  })
})
