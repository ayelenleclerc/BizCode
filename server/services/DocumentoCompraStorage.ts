import fs from 'node:fs/promises'
import path from 'node:path'

/**
 * @en Local filesystem storage for imported purchase documents (#277 Phase A).
 * @es Almacenamiento local de documentos de compra importados (#277 Fase A).
 * @pt-BR Armazenamento local de documentos de compra importados (#277 Fase A).
 */
export class DocumentoCompraStorage {
  constructor(private readonly rootDir: string) {}

  static fromEnv(): DocumentoCompraStorage {
    const configured = process.env.DOCUMENTOS_COMPRA_STORAGE_PATH?.trim()
    const root = configured && configured.length > 0
      ? configured
      : path.join(process.cwd(), 'data', 'documentos-compra')
    return new DocumentoCompraStorage(root)
  }

  private tenantDir(tenantId: number, documentoId: number): string {
    return path.join(this.rootDir, String(tenantId), String(documentoId))
  }

  async saveOriginal(
    tenantId: number,
    documentoId: number,
    originalName: string,
    buffer: Buffer,
  ): Promise<string> {
    const dir = this.tenantDir(tenantId, documentoId)
    await fs.mkdir(dir, { recursive: true })
    const safeName = path.basename(originalName).replace(/[^\w.\-() ]+/g, '_') || 'documento'
    const absolutePath = path.join(dir, safeName)
    await fs.writeFile(absolutePath, buffer)
    return path.relative(this.rootDir, absolutePath).replace(/\\/g, '/')
  }

  async readOriginal(relativePath: string): Promise<Buffer> {
    const absolute = path.join(this.rootDir, relativePath)
    return fs.readFile(absolute)
  }
}
