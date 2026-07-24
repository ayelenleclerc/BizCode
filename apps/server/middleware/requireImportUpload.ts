import type { NextFunction, Request, Response } from 'express'

/**
 * @en Rejects bulk-import POSTs without a multer file buffer (validation, not auth).
 * @es Rechaza POST de importación masiva sin buffer multer (validación, no auth).
 * @pt-BR Rejeita POST de importação em massa sem buffer multer (validação, não auth).
 */
export function requireImportUpload(req: Request, res: Response, next: NextFunction): void {
  const file = req.file
  if (file == null || !Buffer.isBuffer(file.buffer) || file.buffer.byteLength === 0) {
    res.status(400).json({ success: false, error: 'file required' })
    return
  }
  next()
}
