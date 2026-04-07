import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import type { PlanSyncStateFile, SyncStateTodo } from './types'

export function stateDir(repoRoot: string): string {
  return path.join(repoRoot, '.github', 'plan-sync', 'state')
}

export function reportsDir(repoRoot: string): string {
  return path.join(repoRoot, '.github', 'plan-sync', 'reports')
}

export function statePath(repoRoot: string, planSlug: string): string {
  return path.join(stateDir(repoRoot), `${planSlug}.json`)
}

export function loadState(repoRoot: string, planSlug: string): PlanSyncStateFile | undefined {
  const p = statePath(repoRoot, planSlug)
  try {
    const raw = readFileSync(p, 'utf8')
    return JSON.parse(raw) as PlanSyncStateFile
  } catch (e: unknown) {
    if (e instanceof Error && 'code' in e && (e as NodeJS.ErrnoException).code === 'ENOENT') {
      return undefined
    }
    throw e
  }
}

export function saveState(repoRoot: string, state: PlanSyncStateFile): void {
  mkdirSync(stateDir(repoRoot), { recursive: true })
  const p = statePath(repoRoot, state.planSlug)
  writeFileSync(p, `${JSON.stringify(state, null, 2)}\n`, 'utf8')
}

export function upsertStateTodo(todos: SyncStateTodo[], next: SyncStateTodo): SyncStateTodo[] {
  const idx = todos.findIndex((t) => t.id === next.id)
  if (idx === -1) {
    return [...todos, next]
  }
  const copy = [...todos]
  copy[idx] = next
  return copy
}

export function writeReport(repoRoot: string, planSlug: string, md: string): string {
  mkdirSync(reportsDir(repoRoot), { recursive: true })
  const ts = new Date().toISOString().replace(/[:.]/g, '-')
  const file = path.join(reportsDir(repoRoot), `${ts}-${planSlug}.md`)
  writeFileSync(file, md, 'utf8')
  return file
}
