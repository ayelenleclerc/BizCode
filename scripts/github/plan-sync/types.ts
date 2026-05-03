/**
 * @en On-disk state for plan:sync (issue ↔ todo mapping), not the `.plan.md` contract.
 * @es Estado en disco para plan:sync; el contrato del plan vive en `@/lib/plan-sync`.
 * @pt-BR Estado em disco para plan:sync; o contrato do plano está em `@/lib/plan-sync`.
 */
export type SyncStateTodo = {
  id: string
  issueNumber: number
  issueNodeId: string
  projectItemId?: string
  lastContentHash: string
}

export type PlanSyncStateFile = {
  planSlug: string
  planPath: string
  planHash: string
  syncedAt: string
  todos: SyncStateTodo[]
}
