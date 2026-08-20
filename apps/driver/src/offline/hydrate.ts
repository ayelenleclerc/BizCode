import { driverCobrosApi, driverFormasPagoApi, driverRepartosApi } from '../api/driverApi'
import { getOfflineDb } from './db'
import { localYmd } from './localYmd'
import { offlineMeta } from './meta'
import { saveFormasPagoCache, saveRepartoCache, saveTransferInfoCache } from './repos'

export type DriverHydrateStats = {
  hasReparto: boolean
  formasPago: number
  hasTransferInfo: boolean
}

/**
 * @en Pulls day cache from API into SQLite (online only).
 * @es Descarga el cache del día desde la API a SQLite (solo online).
 * @pt-BR Baixa o cache do dia da API para SQLite (somente online).
 */
export async function hydrateOfflineCache(opts?: { fecha?: string }): Promise<DriverHydrateStats> {
  const db = await getOfflineDb()
  const fecha = opts?.fecha ?? localYmd()
  const stats: DriverHydrateStats = { hasReparto: false, formasPago: 0, hasTransferInfo: false }

  const reparto = (await driverRepartosApi.getMiReparto({ fecha })) ?? null
  await saveRepartoCache(db, reparto)
  stats.hasReparto = reparto != null && reparto.items.length > 0

  try {
    const formas = (await driverFormasPagoApi.list()) ?? []
    await saveFormasPagoCache(db, formas)
    stats.formasPago = formas.length
  } catch {
    // keep previous formas cache
  }

  try {
    const info = await driverCobrosApi.getTransferInfo()
    await saveTransferInfoCache(db, info ?? null)
    stats.hasTransferInfo = info != null
  } catch {
    // keep previous transfer cache
  }

  offlineMeta.setCacheDay(fecha)
  offlineMeta.setLastHydrateAt(new Date().toISOString())
  return stats
}
