/**
 * @en Updates login geo baseline and returns metadata flags for audit (#221).
 * @es Actualiza el baseline geo de login y flags de metadata para audit (#221).
 * @pt-BR Atualiza o baseline geo de login e flags de metadata para audit (#221).
 */

import type { PrismaClient } from '@prisma/client'
import { resolveCountryFromIp } from './geoip'

export type LoginGeoAuditFields = {
  country: string | null
  previousCountry: string | null
  geoAnomaly: boolean
}

/**
 * @en Resolves country from IP, detects anomaly vs stored baseline, and persists new country when known.
 * @es Resuelve país desde IP, detecta anomalía vs baseline y persiste el país nuevo si se conoce.
 * @pt-BR Resolve país a partir do IP, detecta anomalia vs baseline e persiste o novo país se conhecido.
 */
export async function applyLoginGeoBaseline(
  prisma: PrismaClient,
  userId: number,
  ipAddress: string | null | undefined,
  previousCountry: string | null | undefined,
): Promise<LoginGeoAuditFields> {
  const country = resolveCountryFromIp(ipAddress)
  const prior = previousCountry ?? null
  const geoAnomaly =
    country != null && prior != null && country !== prior

  if (country != null && country !== prior) {
    try {
      await prisma.appUser.update({
        where: { id: userId },
        data: { lastLoginCountry: country },
      })
    } catch {
      // Baseline update must not block login.
    }
  } else if (country != null && prior == null) {
    try {
      await prisma.appUser.update({
        where: { id: userId },
        data: { lastLoginCountry: country },
      })
    } catch {
      // Baseline update must not block login.
    }
  }

  return { country, previousCountry: prior, geoAnomaly }
}
