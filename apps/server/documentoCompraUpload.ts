import multer from 'multer'

/** @en Max upload size for purchase document import (#277). */
export const DOCUMENTO_COMPRA_MAX_FILE_BYTES = 10 * 1024 * 1024

/** @en Max files per batch upload (#277). */
export const DOCUMENTO_COMPRA_BATCH_MAX = 20

const ALLOWED_EXTENSIONS = new Set(['.pdf', '.jpg', '.jpeg', '.png', '.webp', '.heic', '.heif'])

const MIME_TO_TIPO: Record<string, string> = {
  'application/pdf': 'pdf',
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/heic': 'heic',
  'image/heif': 'heic',
}

/**
 * @en Maps MIME type to stored tipoArchivo (#277).
 * @es Mapea MIME a tipoArchivo almacenado (#277).
 * @pt-BR Mapeia MIME para tipoArchivo armazenado (#277).
 */
export function resolveDocumentoCompraTipoArchivo(mime: string, originalName: string): string | null {
  const normalized = mime.toLowerCase().split(';')[0]?.trim() ?? ''
  const fromMime = MIME_TO_TIPO[normalized]
  if (fromMime) return fromMime
  const ext = originalName.toLowerCase().match(/\.[a-z0-9]+$/)?.[0] ?? ''
  if (ext === '.jpeg') return 'jpg'
  if (ext === '.heif') return 'heic'
  if (ALLOWED_EXTENSIONS.has(ext)) return ext.slice(1)
  return null
}

/**
 * @en Multipart upload for purchase documents (#277).
 * @es Upload multipart para documentos de compra (#277).
 * @pt-BR Upload multipart para documentos de compra (#277).
 */
export function documentoCompraUploadSingle() {
  return multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: DOCUMENTO_COMPRA_MAX_FILE_BYTES },
    fileFilter: (_req, file, cb) => {
      const tipo = resolveDocumentoCompraTipoArchivo(file.mimetype, file.originalname)
      if (tipo) {
        cb(null, true)
        return
      }
      cb(null, false)
    },
  }).single('file')
}

/**
 * @en Multipart batch upload for purchase documents (#277, max 20 files).
 * @es Upload multipart por lote para documentos de compra (#277, máx. 20 archivos).
 * @pt-BR Upload multipart em lote para documentos de compra (#277, máx. 20 arquivos).
 */
export function documentoCompraUploadBatch() {
  return multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: DOCUMENTO_COMPRA_MAX_FILE_BYTES },
    fileFilter: (_req, file, cb) => {
      const tipo = resolveDocumentoCompraTipoArchivo(file.mimetype, file.originalname)
      if (tipo) {
        cb(null, true)
        return
      }
      cb(null, false)
    },
  }).array('files', DOCUMENTO_COMPRA_BATCH_MAX)
}
