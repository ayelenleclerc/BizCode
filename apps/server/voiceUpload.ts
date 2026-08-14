import multer from 'multer'
import { VOICE_TRANSCRIBE_MAX_BYTES } from './lib/whisperTranscribe'

const ALLOWED_EXT = new Set(['.m4a', '.mp4', '.mp3', '.wav', '.webm', '.mpeg', '.ogg', '.aac'])

/**
 * @en Multipart upload for Whisper transcription (field "file", max 4 MiB) (#266).
 * @es Upload multipart para transcripción Whisper (campo "file", máx. 4 MiB) (#266).
 * @pt-BR Upload multipart para transcrição Whisper (campo "file", máx. 4 MiB) (#266).
 */
export function voiceTranscribeUploadSingle() {
  return multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: VOICE_TRANSCRIBE_MAX_BYTES },
    fileFilter: (_req, file, cb) => {
      const name = file.originalname.toLowerCase()
      const ext = name.includes('.') ? name.slice(name.lastIndexOf('.')) : ''
      if (ALLOWED_EXT.has(ext) || file.mimetype.startsWith('audio/')) {
        cb(null, true)
        return
      }
      cb(null, false)
    },
  }).single('file')
}
