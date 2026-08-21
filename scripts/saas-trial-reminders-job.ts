/**
 * @en Daily job: email trial reminders 7/3/1 days before end; suspend overdue trials (#180).
 * @es Job diario: emails de recordatorio 7/3/1 días antes; suspende trials vencidos (#180).
 * @pt-BR Job diário: e-mails de lembrete 7/3/1 dias antes; suspende trials vencidos (#180).
 */
import { config } from 'dotenv'
import { PrismaClient } from '@prisma/client'
import nodemailer from 'nodemailer'
import { isSmtpConfigured } from '../apps/server/channels'
import { resolveSmtpTransportConfig } from '../apps/server/config/smtpTransport'
import { logger } from '../apps/server/logger'
import {
  SAAS_STATUS_SUSPENDED_TRIAL,
  SAAS_STATUS_TRIAL,
  TRIAL_REMINDER_DAYS_BEFORE,
  trialDaysRemaining,
} from '../apps/server/saas/saasStatus'

config()

function startOfUtcDay(d: Date): Date {
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()))
}

async function sendReminder(to: string, days: number, tenantSlug: string): Promise<boolean> {
  if (!isSmtpConfigured()) return false
  const smtp = resolveSmtpTransportConfig()
  if (!smtp) return false
  try {
    const transporter = nodemailer.createTransport({
      host: smtp.host,
      port: smtp.port,
      secure: smtp.secure,
      auth: smtp.auth,
    })
    await transporter.sendMail({
      from: smtp.from,
      to,
      subject: `BizCode — quedan ${days} día(s) de trial (${tenantSlug})`,
      text: `Tu trial de BizCode (tenant ${tenantSlug}) vence en ${days} día(s).\n`,
    })
    return true
  } catch (err) {
    logger.warn(
      { err: err instanceof Error ? { name: err.name, message: err.message } : String(err) },
      '[saas-trial-reminders] send failed',
    )
    return false
  }
}

async function main(): Promise<void> {
  const prisma = new PrismaClient()
  const now = new Date()
  let reminders = 0
  let suspended = 0
  let skippedNoSmtp = 0

  try {
    const expired = await prisma.tenant.findMany({
      where: {
        saasStatus: SAAS_STATUS_TRIAL,
        trialEndsAt: { lte: now },
      },
      select: { id: true },
    })
    for (const row of expired) {
      await prisma.tenant.update({
        where: { id: row.id },
        data: { saasStatus: SAAS_STATUS_SUSPENDED_TRIAL },
      })
      suspended += 1
    }

    const activeTrials = await prisma.tenant.findMany({
      where: {
        saasStatus: SAAS_STATUS_TRIAL,
        trialEndsAt: { not: null },
        contactEmail: { not: null },
      },
      select: {
        id: true,
        slug: true,
        contactEmail: true,
        trialEndsAt: true,
      },
    })

    const smtpOk = isSmtpConfigured()
    for (const tenant of activeTrials) {
      if (!tenant.trialEndsAt || !tenant.contactEmail) continue
      const days = trialDaysRemaining(tenant.trialEndsAt, startOfUtcDay(now))
      if (days === null) continue
      if (!(TRIAL_REMINDER_DAYS_BEFORE as readonly number[]).includes(days)) continue
      if (!smtpOk) {
        skippedNoSmtp += 1
        continue
      }
      const sent = await sendReminder(tenant.contactEmail, days, tenant.slug)
      if (sent) reminders += 1
    }

    logger.info(
      { reminders, suspended, skippedNoSmtp, smtpConfigured: smtpOk },
      '[saas-trial-reminders] done',
    )
  } finally {
    await prisma.$disconnect()
  }
}

main().catch((err: unknown) => {
  console.error(err)
  process.exit(1)
})
