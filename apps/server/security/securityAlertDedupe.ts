/**
 * @en Claims alert dedupe slots so multi-replica / repeated polls do not spam (#221).
 * @es Reserva slots de dedupe para que réplicas/polls no spameen alertas (#221).
 * @pt-BR Reserva slots de dedupe para que réplicas/polls não spammam alertas (#221).
 */

import type { PrismaClient } from '@prisma/client'

const DEFAULT_WINDOW_MS = 15 * 60 * 1000

/**
 * @en Returns true if this process may fire the alert (slot claimed or window expired).
 * @es True si este proceso puede disparar la alerta (slot reclamado o ventana vencida).
 * @pt-BR True se este processo pode disparar o alerta (slot reclamado ou janela expirada).
 */
export async function tryClaimSecurityAlert(
  prisma: PrismaClient,
  ruleKey: string,
  subjectKey: string,
  windowMs: number = DEFAULT_WINDOW_MS,
): Promise<boolean> {
  const now = new Date()
  const existing = await prisma.securityAlertDedupe.findUnique({
    where: { ruleKey_subjectKey: { ruleKey, subjectKey } },
  })
  if (existing && now.getTime() - existing.firedAt.getTime() < windowMs) {
    return false
  }
  await prisma.securityAlertDedupe.upsert({
    where: { ruleKey_subjectKey: { ruleKey, subjectKey } },
    create: { ruleKey, subjectKey, firedAt: now },
    update: { firedAt: now },
  })
  return true
}
