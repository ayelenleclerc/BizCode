import { z } from 'zod'

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

/**
 * @en Cursor `.plan.md` frontmatter shape (extra keys like `isProject` allowed).
 * @es Forma del frontmatter de `.plan.md` de Cursor (se permiten claves extra).
 * @pt-BR Forma do frontmatter do `.plan.md` do Cursor (chaves extras permitidas).
 */
export const PlanFrontmatterSchema = z
  .object({
    name: z.string().min(1),
    overview: z.string().min(1),
    todos: z.array(PlanTodoSchema).min(1),
    isProject: z.boolean().optional(),
  })
  .passthrough()

export type PlanTodo = z.infer<typeof PlanTodoSchema>
export type PlanDocument = z.infer<typeof PlanFrontmatterSchema>
