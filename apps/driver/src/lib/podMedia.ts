/** Client-side POD media limits (#161), aligned with server OpenAPI. */
export const POD_MAX_FIRMA_BYTES = 50 * 1024
export const POD_MAX_FOTO_BYTES = 200 * 1024
export const POD_MAX_PHOTO_DIM = 1280

export type PhotoResize = { width: number; height: number }

export type PhotoManipulateFn = (
  uri: string,
  resize: PhotoResize | null,
  compress: number,
) => Promise<string>

export type PhotoSizeFn = (uri: string) => Promise<PhotoResize>

/**
 * @en Decoded byte length of a data-URL or raw base64 string.
 * @es Tamaño en bytes decodificado de data-URL o base64.
 * @pt-BR Tamanho em bytes decodificado de data-URL ou base64.
 */
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

/**
 * @en Scale width/height so the longest side is at most maxDim.
 * @es Escala ancho/alto para que el lado mayor no supere maxDim.
 * @pt-BR Redimensiona para que o lado maior não ultrapasse maxDim.
 */
export function resizeDimensions(width: number, height: number, maxDim: number): PhotoResize {
  const scale = Math.min(1, maxDim / Math.max(width, height, 1))
  return {
    width: Math.max(1, Math.round(width * scale)),
    height: Math.max(1, Math.round(height * scale)),
  }
}

export function toJpegDataUrl(base64OrDataUrl: string): string {
  const trimmed = base64OrDataUrl.trim()
  if (trimmed.startsWith('data:')) return trimmed
  return `data:image/jpeg;base64,${trimmed}`
}

export function compressSignatureDataUrl(dataUrl: string, maxBytes: number): string {
  if (base64PayloadByteLength(dataUrl) <= maxBytes) return dataUrl
  throw new Error('POD_FIRMA_TOO_LARGE')
}

async function defaultGetSize(uri: string): Promise<PhotoResize> {
  const { Image } = await import('react-native')
  return new Promise((resolve, reject) => {
    Image.getSize(
      uri,
      (width, height) => resolve({ width, height }),
      (error) => reject(error instanceof Error ? error : new Error(String(error))),
    )
  })
}

async function defaultManipulate(uri: string, resize: PhotoResize | null, compress: number): Promise<string> {
  const { SaveFormat, manipulateAsync } = await import('expo-image-manipulator')
  const result = await manipulateAsync(uri, resize ? [{ resize }] : [], {
    compress,
    format: SaveFormat.JPEG,
    base64: true,
  })
  if (!result.base64) throw new Error('POD_FOTO_TOO_LARGE')
  return toJpegDataUrl(result.base64)
}

/**
 * @en Resize and compress a photo URI to JPEG under maxBytes.
 * @es Redimensiona y comprime una foto (URI) a JPEG bajo maxBytes.
 * @pt-BR Redimensiona e comprime uma foto (URI) para JPEG abaixo de maxBytes.
 */
export async function compressPhotoUri(
  uri: string,
  maxBytes: number,
  options?: {
    width?: number
    height?: number
    getSize?: PhotoSizeFn
    manipulate?: PhotoManipulateFn
  },
): Promise<string> {
  const getSize = options?.getSize ?? defaultGetSize
  const manipulate = options?.manipulate ?? defaultManipulate
  const size =
    options?.width != null && options.height != null && options.width > 0 && options.height > 0
      ? { width: options.width, height: options.height }
      : await getSize(uri)
  const resize = resizeDimensions(size.width, size.height, POD_MAX_PHOTO_DIM)
  const needsResize = resize.width !== size.width || resize.height !== size.height

  let quality = 0.85
  let dataUrl = await manipulate(uri, needsResize ? resize : null, quality)
  while (base64PayloadByteLength(dataUrl) > maxBytes && quality > 0.35) {
    quality -= 0.1
    dataUrl = await manipulate(uri, needsResize ? resize : null, quality)
  }
  if (base64PayloadByteLength(dataUrl) > maxBytes) {
    throw new Error('POD_FOTO_TOO_LARGE')
  }
  return dataUrl
}
