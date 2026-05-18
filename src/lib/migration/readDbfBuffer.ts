import fs from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { DBFFile } from 'dbffile'

const DBF_ENCODING = 'cp437' as const

/**
 * @en Reads all records from an uploaded DBF buffer via a temporary file (dbffile requires a path).
 * @es Lee todos los registros de un buffer DBF subido mediante archivo temporal (dbffile requiere ruta).
 * @pt-BR Lê todos os registros de um buffer DBF enviado via arquivo temporário (dbffile exige caminho).
 */
export async function readDbfRecordsFromBuffer(buffer: Buffer): Promise<Record<string, unknown>[]> {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), 'bizcode-dbf-upload-'))
  const filePath = path.join(dir, 'upload.dbf')
  try {
    await fs.writeFile(filePath, buffer)
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
