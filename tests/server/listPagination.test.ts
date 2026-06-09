import type { Request } from 'express'
import { describe, expect, it } from 'vitest'
import { LIST_PAGE_DEFAULT, LIST_PAGE_MAX, paginatedListJson, parseListPagination } from '../../server/services/listPagination'

describe('parseListPagination', () => {
  it('applies default limit and zero offset when query omitted', () => {
    const req = { query: {} } as unknown as Request
    expect(parseListPagination(req)).toEqual({ take: LIST_PAGE_DEFAULT, skip: 0 })
  })

  it('parses limit and offset from query strings', () => {
    const req = { query: { limit: '10', offset: '3' } } as unknown as Request
    expect(parseListPagination(req)).toEqual({ take: 10, skip: 3 })
  })

  it('caps limit at LIST_PAGE_MAX', () => {
    const req = { query: { limit: String(LIST_PAGE_MAX + 50) } } as unknown as Request
    expect(parseListPagination(req).take).toBe(LIST_PAGE_MAX)
  })
})

describe('paginatedListJson', () => {
  it('returns success envelope with pagination fields', () => {
    expect(paginatedListJson(['a'], 50, 10, 5)).toEqual({
      success: true,
      data: ['a'],
      total: 50,
      limit: 10,
      offset: 5,
    })
  })
})
