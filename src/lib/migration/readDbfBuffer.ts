import fs from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { DBFFile } from 'dbffile'

const DBF_ENCODING = 'cp437' as const

/** @en Max upload size for legacy DBF migration (aligned with `server/dbfImport.ts`). */
export const DBF_UPLOAD_MAX_BYTES = 8 * 1024 * 1024

const DBF_VERSION_BYTES = new Set([
  0x02, 0x03, 0x30, 0x31, 0x32, 0x33, 0x43, 0x63, 0x83, 0x8b, 0xcb, 0xf5,
])

/**
 * @en Validates DBF header structure before persisting an uploaded buffer to disk.
 * @es Valida la estructura del encabezado DBF antes de persistir en disco un buffer subido.
 * @pt-BR Valida a estrutura do cabeçalho DBF antes de persistir em disco um buffer enviado.
 */
export function assertValidDbfUploadBuffer(buffer: Buffer): void {
  if (buffer.length < 32) {
    throw new Error('Invalid DBF: file too small')
  }
  if (buffer.length > DBF_UPLOAD_MAX_BYTES) {
    throw new Error('Invalid DBF: file too large')
  }
  if (!DBF_VERSION_BYTES.has(buffer[0]!)) {
    throw new Error('Invalid DBF: unrecognized version byte')
  }
  const headerLength = buffer.readUInt16LE(8)
  if (headerLength < 32 || headerLength > buffer.length) {
    throw new Error('Invalid DBF: invalid header length')
  }
  if (buffer[headerLength - 1] !== 0x0d) {
    throw new Error('Invalid DBF: missing header terminator')
  }
}

/**
 * @en Reads all records from an uploaded DBF buffer via a temporary file (dbffile requires a path).
 * @es Lee todos los registros de un buffer DBF subido mediante archivo temporal (dbffile requiere ruta).
 * @pt-BR Lê todos os registros de um buffer DBF enviado via arquivo temporário (dbffile exige caminho).
 */
export async function readDbfRecordsFromBuffer(buffer: Buffer): Promise<Record<string, unknown>[]> {
  assertValidDbfUploadBuffer(buffer)

  const dir = await fs.mkdtemp(path.join(os.tmpdir(), 'bizcode-dbf-upload-'))
  const filePath = path.join(dir, 'upload.dbf')
  try {
    const handle = await fs.open(filePath, 'wx', 0o600)
    try {
      await handle.writeFile(buffer)
    } finally {
      await handle.close()
    }
    const dbf = await DBFFile.open(filePath, { readMode: 'loose', encoding: DBF_ENCODING })
    const rows: Record<string, unknown>[] = []
    for await (const raw of dbf) {
      rows.push(raw as Record<string, unknown>)
    }
    return rows
  } finally {
    await fs.rm(dir, { recursive: true, force: true })
  }
}
