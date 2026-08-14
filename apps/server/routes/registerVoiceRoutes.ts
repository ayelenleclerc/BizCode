import type { Application, Request, Response } from 'express'
import { requirePermission, type AuthenticatedRequest } from '../auth'
import { isOpenAiConfigured, transcribeAudioWithWhisper } from '../lib/whisperTranscribe'
import { voiceTranscribeUploadSingle } from '../voiceUpload'

/**
 * @en Registers POST /api/voice/transcribe for App Seller speech-to-order (#266).
 * @es Registra POST /api/voice/transcribe para toma de pedido por voz (#266).
 * @pt-BR Registra POST /api/voice/transcribe para tomada de pedido por voz (#266).
 */
export function registerVoiceRoutes(app: Application): void {
  app.post(
    '/api/voice/transcribe',
    requirePermission('orders.create'),
    voiceTranscribeUploadSingle(),
    async (req: Request, res: Response) => {
      const authReq = req as AuthenticatedRequest
      if (!authReq.auth) {
        res.status(401).json({ success: false, error: 'Authentication required' })
        return
      }
      if (!isOpenAiConfigured()) {
        res.status(503).json({ success: false, error: 'Voice transcription is not configured' })
        return
      }
      const file = req.file
      if (!file?.buffer?.length) {
        res.status(400).json({ success: false, error: 'Expected multipart field "file"' })
        return
      }
      const localeRaw = req.body?.locale
      const locale = typeof localeRaw === 'string' ? localeRaw.trim() : undefined
      try {
        const text = await transcribeAudioWithWhisper({
          buffer: file.buffer,
          filename: file.originalname || 'audio.m4a',
          mime: file.mimetype || 'application/octet-stream',
          apiKey: process.env.OPENAI_API_KEY!.trim(),
          locale,
        })
        res.status(200).json({ success: true, data: { text } })
      } catch {
        res.status(502).json({ success: false, error: 'Whisper transcription failed' })
      }
    },
  )
}
