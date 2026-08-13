import { toAbsoluteUploadUrl } from './thumbUrl'

const DIR_NAME = 'articulo-thumbs'
const prefetchedIds = new Set<number>()
let documentDirectoryCache: string | null = null

function dirUri(documentDirectory: string): string {
  return `${documentDirectory}${DIR_NAME}/`
}

export function localThumbFileUri(documentDirectory: string, articuloId: number): string {
  return `${dirUri(documentDirectory)}${articuloId}.webp`
}

/**
 * @en Sync URI: local file after prefetch, else remote upload URL (#257).
 * @es URI sincrónica: archivo local tras prefetch, si no URL remota (#257).
 * @pt-BR URI síncrona: arquivo local após prefetch, senão URL remota (#257).
 */
export function resolveThumbUriSync(
  articuloId: number,
  urlThumb?: string | null,
): string | null {
  if (documentDirectoryCache && prefetchedIds.has(articuloId)) {
    return localThumbFileUri(documentDirectoryCache, articuloId)
  }
  return toAbsoluteUploadUrl(urlThumb)
}

/**
 * @en Downloads principal thumbs into expo-file-system for offline grid (#257).
 * @es Descarga thumbs principales a expo-file-system para grilla offline (#257).
 * @pt-BR Baixa thumbs principais para expo-file-system para grade offline (#257).
 */
export async function prefetchArticuloThumbs(
  items: Array<{ id: number; urlThumb?: string | null }>,
): Promise<number> {
  let FileSystem: typeof import('expo-file-system/legacy')
  try {
    FileSystem = await import('expo-file-system/legacy')
  } catch {
    return 0
  }
  const root = FileSystem.documentDirectory
  if (!root) return 0
  documentDirectoryCache = root
  const dir = dirUri(root)
  try {
    const info = await FileSystem.getInfoAsync(dir)
    if (!info.exists) {
      await FileSystem.makeDirectoryAsync(dir, { intermediates: true })
    }
  } catch {
    return 0
  }
  let ok = 0
  for (const item of items) {
    if (typeof item.id !== 'number') continue
    const abs = toAbsoluteUploadUrl(item.urlThumb)
    if (!abs) continue
    const dest = localThumbFileUri(root, item.id)
    try {
      const existing = await FileSystem.getInfoAsync(dest)
      if (!existing.exists) {
        await FileSystem.downloadAsync(abs, dest)
      }
      prefetchedIds.add(item.id)
      ok += 1
    } catch {
      // skip one thumb
    }
  }
  return ok
}

/** @internal test helper */
export function resetThumbCacheForTests(): void {
  prefetchedIds.clear()
  documentDirectoryCache = null
}
