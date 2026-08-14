export const VOICE_TRANSCRIBE_MAX_BYTES = 4 * 1024 * 1024
export const WHISPER_MODEL = 'whisper-1'
export const OPENAI_TRANSCRIPTIONS_URL = 'https://api.openai.com/v1/audio/transcriptions'

/**
 * @en True when OPENAI_API_KEY is set for Whisper transcription (#266).
 * @es True si OPENAI_API_KEY está seteada para transcribir con Whisper (#266).
 * @pt-BR True se OPENAI_API_KEY estiver definida para transcrever com Whisper (#266).
 */
export function isOpenAiConfigured(env: NodeJS.ProcessEnv = process.env): boolean {
  return Boolean(env.OPENAI_API_KEY?.trim())
}

/**
 * @en Sends audio to OpenAI Whisper and returns the transcript text only.
 * @es Envía audio a OpenAI Whisper y devuelve solo el texto transcrito.
 * @pt-BR Envia áudio ao OpenAI Whisper e devolve só o texto transcrito.
 */
export async function transcribeAudioWithWhisper(input: {
  buffer: Buffer
  filename: string
  mime: string
  apiKey: string
  locale?: string
  fetchImpl?: typeof fetch
}): Promise<string> {
  const fetchImpl = input.fetchImpl ?? fetch
  const form = new FormData()
  const blob = new Blob([new Uint8Array(input.buffer)], { type: input.mime || 'application/octet-stream' })
  form.append('file', blob, input.filename || 'audio.m4a')
  form.append('model', WHISPER_MODEL)
  const lang = whisperLanguage(input.locale)
  if (lang) form.append('language', lang)

  const response = await fetchImpl(OPENAI_TRANSCRIPTIONS_URL, {
    method: 'POST',
    headers: { Authorization: `Bearer ${input.apiKey}` },
    body: form,
  })
  const raw = (await response.json()) as { text?: unknown; error?: { message?: unknown } }
  if (!response.ok) {
    const message = typeof raw.error?.message === 'string' ? raw.error.message : `Whisper HTTP ${response.status}`
    throw new Error(message)
  }
  const text = typeof raw.text === 'string' ? raw.text.trim() : ''
  if (!text) {
    throw new Error('Whisper returned empty text')
  }
  return text
}

function whisperLanguage(locale: string | undefined): string | undefined {
  if (!locale) return undefined
  const base = locale.split('-')[0]?.toLowerCase()
  if (base === 'es' || base === 'en' || base === 'pt') return base
  return undefined
}
