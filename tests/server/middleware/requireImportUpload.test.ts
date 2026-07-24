import type { NextFunction, Request, Response } from 'express'
import { describe, expect, it, vi } from 'vitest'
import { requireImportUpload } from '../../../apps/server/middleware/requireImportUpload'

describe('requireImportUpload (#238)', () => {
  it('rejects missing or empty upload', () => {
    const res = { status: vi.fn().mockReturnThis(), json: vi.fn() } as unknown as Response
    const next = vi.fn() as NextFunction
    requireImportUpload({ file: undefined } as Request, res, next)
    expect(res.status).toHaveBeenCalledWith(400)
    expect(next).not.toHaveBeenCalled()

    requireImportUpload(
      { file: { buffer: Buffer.alloc(0), originalname: 'x.csv' } } as Request,
      res,
      next,
    )
    expect(next).not.toHaveBeenCalled()
  })

  it('calls next when buffer is present', () => {
    const res = { status: vi.fn().mockReturnThis(), json: vi.fn() } as unknown as Response
    const next = vi.fn() as NextFunction
    requireImportUpload(
      { file: { buffer: Buffer.from('a'), originalname: 'x.csv' } } as Request,
      res,
      next,
    )
    expect(next).toHaveBeenCalled()
  })
})
