import { z } from 'zod'

/**
 * @en Cursor `.plan.md` contract: frontmatter `name`, `overview`, `todos[]` with `id`, `content`, `status`, optional `meta` (type, priority, area). Defaults: feature, P1, platform.
 * @es Contrato de `.plan.md`: frontmatter con campos obligatorios y `meta` opcional; valores por defecto: feature, P1, platform.
 * @pt-BR Contrato do `.plan.md`: frontmatter com campos obrigatórios e `meta` opcional; padrões: feature, P1, platform.
 */
export const todoStatuses = ['pending', 'in_progress', 'completed', 'cancelled'] as const
export type TodoStatus = (typeof todoStatuses)[number]

export const metaTypes = ['feature', 'bug', 'security', 'docs', 'chore', 'tech-debt'] as const
export type MetaType = (typeof metaTypes)[number]

export const metaPriorities = ['P0', 'P1', 'P2'] as const
export type MetaPriority = (typeof metaPriorities)[number]

export const metaAreas = [
  'iam',
  'sales',
  'billing',
  'inventory',
  'orders',
  'logistics',
  'finance',
  'platform',
  'quality',
  'iso',
] as const
export type MetaArea = (typeof metaAreas)[number]

export const PlanTodoMetaSchema = z
  .object({
    type: z.enum(metaTypes).optional(),
    priority: z.enum(metaPriorities).optional(),
    area: z.enum(metaAreas).optional(),
  })
  .optional()

export const PlanTodoSchema = z.object({
  id: z.string().min(1),
  content: z.string().min(1),
  status: z.enum(todoStatuses),
  meta: PlanTodoMetaSchema,
})

export const PlanFrontmatterSchema = z.object({
  name: z.string().min(1),
  overview: z.string(),
  todos: z.array(PlanTodoSchema).min(1),
  isProject: z.boolean().optional(),
})

export type PlanTodo = z.infer<typeof PlanTodoSchema>
export type PlanDocument = z.infer<typeof PlanFrontmatterSchema>

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
