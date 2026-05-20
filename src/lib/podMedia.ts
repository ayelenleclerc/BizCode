/** Client-side POD media limits (issue #142), aligned with server. */
export const POD_MAX_FIRMA_BYTES = 50 * 1024
export const POD_MAX_FOTO_BYTES = 200 * 1024

export function base64PayloadByteLength(value: string): number {
  const trimmed = value.trim()
  if (trimmed.length === 0) return 0
  const comma = trimmed.indexOf(',')
  const payload = comma >= 0 ? trimmed.slice(comma + 1) : trimmed
  const normalized = payload.replace(/\s/g, '')
  if (normalized.length === 0) return 0
  const padding = normalized.endsWith('==') ? 2 : normalized.endsWith('=') ? 1 : 0
  return Math.floor((normalized.length * 3) / 4) - padding
}

export function canvasToPngDataUrl(canvas: HTMLCanvasElement): string {
  return canvas.toDataURL('image/png')
}

export function isSignatureCanvasBlank(canvas: HTMLCanvasElement): boolean {
  const ctx = canvas.getContext('2d')
  if (!ctx) return true
  const { width, height } = canvas
  if (width === 0 || height === 0) return true
  const data = ctx.getImageData(0, 0, width, height).data
  for (let i = 3; i < data.length; i += 4) {
    if (data[i] !== 0) return false
  }
  return true
}

/**
 * @en Resize and compress a photo file to JPEG under maxBytes.
 * @es Redimensiona y comprime foto a JPEG bajo maxBytes.
 * @pt-BR Redimensiona e comprime foto para JPEG abaixo de maxBytes.
 */
export async function compressPhotoFile(file: File, maxBytes: number): Promise<string> {
  const bitmap = await createImageBitmap(file)
  const maxDim = 1280
  const scale = Math.min(1, maxDim / Math.max(bitmap.width, bitmap.height))
  const w = Math.max(1, Math.round(bitmap.width * scale))
  const h = Math.max(1, Math.round(bitmap.height * scale))
  const canvas = document.createElement('canvas')
  canvas.width = w
  canvas.height = h
  const ctx = canvas.getContext('2d')
  if (!ctx) {
    bitmap.close()
    throw new Error('Canvas not supported')
  }
  ctx.drawImage(bitmap, 0, 0, w, h)
  bitmap.close()

  let quality = 0.85
  let dataUrl = canvas.toDataURL('image/jpeg', quality)
  while (base64PayloadByteLength(dataUrl) > maxBytes && quality > 0.35) {
    quality -= 0.1
    dataUrl = canvas.toDataURL('image/jpeg', quality)
  }
  if (base64PayloadByteLength(dataUrl) > maxBytes) {
    throw new Error('POD_FOTO_TOO_LARGE')
  }
  return dataUrl
}

export function compressSignatureDataUrl(dataUrl: string, maxBytes: number): string {
  if (base64PayloadByteLength(dataUrl) <= maxBytes) return dataUrl
  throw new Error('POD_FIRMA_TOO_LARGE')
}
