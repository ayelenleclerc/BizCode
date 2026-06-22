import type { Request } from 'express'

/** @internal aligned with OpenAPI `ListLimit` / `ListOffset` caps */
export const LIST_PAGE_MAX = 500 as const
export const LIST_PAGE_DEFAULT = 100 as const

export function parseListPagination(req: Request): { take: number; skip: number } {
  const lq = req.query.limit
  const oq = req.query.offset
  const limitRaw = typeof lq === 'string' ? Number.parseInt(lq, 10) : Number.NaN
  const offsetRaw = typeof oq === 'string' ? Number.parseInt(oq, 10) : Number.NaN
  const take =
    Number.isFinite(limitRaw) && limitRaw >= 1 ? Math.min(limitRaw, LIST_PAGE_MAX) : LIST_PAGE_DEFAULT
  const skip = Number.isFinite(offsetRaw) && offsetRaw >= 0 ? offsetRaw : 0
  return { take, skip }
}

/**
 * @en Response body for paginated GET lists (`data` + `total` / `limit` / `offset` per OpenAPI list envelopes).
 * @es Cuerpo de respuesta para listas GET paginadas (`data` + `total` / `limit` / `offset`).
 * @pt-BR Corpo de resposta para listas GET paginadas (`data` + `total` / `limit` / `offset`).
 */
export function paginatedListJson<T>(data: T[], total: number, take: number, skip: number): {
  success: true
  data: T[]
  total: number
  limit: number
  offset: number
} {
  return { success: true, data, total, limit: take, offset: skip }
}
