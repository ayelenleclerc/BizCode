import multer from 'multer'

/** @en Max upload size for legacy DBF migration endpoints. */
export const DBF_IMPORT_MAX_FILE_BYTES = 8 * 1024 * 1024

/**
 * @en Multipart upload middleware accepting a single `.dbf` file in field `file`.
 * @es Middleware multipart que acepta un único archivo `.dbf` en el campo `file`.
 * @pt-BR Middleware multipart que aceita um único arquivo `.dbf` no campo `file`.
 */
export function dbfImportUploadSingle() {
  return multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: DBF_IMPORT_MAX_FILE_BYTES },
    fileFilter: (_req, file, cb) => {
      if (file.originalname.toLowerCase().endsWith('.dbf')) {
        cb(null, true)
        return
      }
      cb(null, false)
    },
  }).single('file')
}
