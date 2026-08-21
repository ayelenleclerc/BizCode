import type { PrismaClient } from '@prisma/client'
import nodemailer from 'nodemailer'
import { NEW_TENANT_MODULES, USER_CHANNELS } from '@bizcode/types'
import { hashPassword } from '../passwordHash'
import { validateCUIT } from '../../web/src/lib/validators'
import { mockConsultaPadronA4, normalizeCuitDigits } from '../fiscal/ar/arcaPadronMock'
import { isSmtpConfigured } from '../channels'
import { resolveSmtpTransportConfig } from '../config/smtpTransport'
import { logger } from '../logger'
import {
  SAAS_STATUS_TRIAL,
  SAAS_TRIAL_DAYS,
} from './saasStatus'
import { isValidTenantSlug, normalizeTenantSlug } from './tenantSlug'

export type SaasRegisterInput = {
  businessName: string
  cuit: string
  email: string
  phone?: string
  tenantSlug: string
  password: string
  acceptTerms: boolean
  acceptPrivacy: boolean
}

export type SaasRegisterResult =
  | {
      ok: true
      status: 201
      data: {
        tenantId: number
        tenantSlug: string
        ownerUsername: string
        trialEndsAt: string
        saasStatus: string
        emailSent: boolean
      }
    }
  | { ok: false; status: number; error: string; code?: string }

function addDays(d: Date, days: number): Date {
  const out = new Date(d.getTime())
  out.setUTCDate(out.getUTCDate() + days)
  return out
}

async function sendWelcomeEmail(args: {
  to: string
  tenantSlug: string
  businessName: string
  trialEndsAt: Date
}): Promise<boolean> {
  if (!isSmtpConfigured()) {
    logger.info('[saas-onboarding] SMTP not configured; skipping welcome email')
    return false
  }
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
      to: args.to,
      subject: `Bienvenido a BizCode — trial ${SAAS_TRIAL_DAYS} días`,
      text:
        `Hola,\n\n` +
        `Tu cuenta "${args.businessName}" (slug: ${args.tenantSlug}) está lista.\n` +
        `Trial hasta: ${args.trialEndsAt.toISOString().slice(0, 10)}\n` +
        `Iniciá sesión con tu email como usuario y el tenant slug indicado.\n\n` +
        `BizCode\n`,
    })
    return true
  } catch (err) {
    logger.warn(
      { err: err instanceof Error ? { name: err.name, message: err.message } : String(err) },
      '[saas-onboarding] welcome email failed',
    )
    return false
  }
}

/**
 * @en Registers a new SaaS tenant + owner with a 30-day trial (#180).
 * @es Registra un tenant SaaS + owner con trial de 30 días (#180).
 * @pt-BR Registra um tenant SaaS + owner com trial de 30 dias (#180).
 */
export class SaasOnboardingService {
  constructor(private readonly prisma: PrismaClient) {}

  async register(input: SaasRegisterInput, now = new Date()): Promise<SaasRegisterResult> {
    if (!input.acceptTerms || !input.acceptPrivacy) {
      return {
        ok: false,
        status: 400,
        error: 'Terms and privacy acceptance are required',
        code: 'ACCEPTANCE_REQUIRED',
      }
    }

    const businessName = input.businessName.trim()
    if (businessName.length < 2 || businessName.length > 80) {
      return { ok: false, status: 400, error: 'Invalid business name', code: 'INVALID_NAME' }
    }

    const cuitDigits = normalizeCuitDigits(input.cuit)
    if (!validateCUIT(cuitDigits)) {
      return { ok: false, status: 400, error: 'Invalid CUIT', code: 'INVALID_CUIT' }
    }

    const padron = mockConsultaPadronA4(cuitDigits)
    if (padron.status === 'timeout') {
      return {
        ok: false,
        status: 503,
        error: 'Tax registry lookup temporarily unavailable',
        code: 'PADRON_TIMEOUT',
      }
    }

    const email = input.email.trim().toLowerCase()
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 120) {
      return { ok: false, status: 400, error: 'Invalid email', code: 'INVALID_EMAIL' }
    }

    const phone = input.phone?.trim() || null
    if (phone && phone.length > 40) {
      return { ok: false, status: 400, error: 'Invalid phone', code: 'INVALID_PHONE' }
    }

    const tenantSlug = normalizeTenantSlug(input.tenantSlug)
    if (!isValidTenantSlug(tenantSlug)) {
      return { ok: false, status: 400, error: 'Invalid tenant slug', code: 'INVALID_SLUG' }
    }

    const password = input.password
    if (password.length < 8) {
      return {
        ok: false,
        status: 400,
        error: 'Password must be at least 8 characters',
        code: 'WEAK_PASSWORD',
      }
    }

    const existing = await this.prisma.tenant.findUnique({ where: { slug: tenantSlug } })
    if (existing) {
      return { ok: false, status: 409, error: 'Tenant slug already taken', code: 'SLUG_TAKEN' }
    }

    const trialEndsAt = addDays(now, SAAS_TRIAL_DAYS)
    const ownerUsername = email.slice(0, 60)
    const passwordHash = hashPassword(password)
    const nombreEmpresa = businessName.slice(0, 40)
    const condicionIva =
      padron.status === 'ok' ? padron.persona.condIva : 'RI'

    const created = await this.prisma.$transaction(async (tx) => {
      const tenant = await tx.tenant.create({
        data: {
          name: businessName.slice(0, 80),
          slug: tenantSlug,
          active: true,
          saasStatus: SAAS_STATUS_TRIAL,
          trialEndsAt,
          contactEmail: email,
          contactPhone: phone,
        },
      })

      await tx.tenantConfig.create({
        data: {
          tenantId: tenant.id,
          businessType: 'ambos',
          rubros: [],
          plan: 'starter',
          modules: [...NEW_TENANT_MODULES],
          integrations: [],
        },
      })

      const starterPlan = await tx.plan.findUnique({ where: { key: 'starter' } })
      if (starterPlan) {
        await tx.tenantPlan.create({
          data: {
            tenantId: tenant.id,
            planId: starterPlan.id,
            status: 'active',
          },
        })
      }

      const user = await tx.appUser.create({
        data: {
          tenantId: tenant.id,
          username: ownerUsername,
          passwordHash,
          role: 'owner',
          active: true,
          scopeChannels: [...USER_CHANNELS],
        },
      })

      await tx.paramEmpresa.create({
        data: {
          tenantId: tenant.id,
          nombre: nombreEmpresa,
          cuit: cuitDigits,
          condicionIva,
          domicilio: padron.status === 'ok' ? padron.persona.domicilio?.slice(0, 40) ?? null : null,
        },
      })

      return { tenant, user }
    })

    const emailSent = await sendWelcomeEmail({
      to: email,
      tenantSlug,
      businessName,
      trialEndsAt,
    })

    return {
      ok: true,
      status: 201,
      data: {
        tenantId: created.tenant.id,
        tenantSlug,
        ownerUsername: created.user.username,
        trialEndsAt: trialEndsAt.toISOString(),
        saasStatus: SAAS_STATUS_TRIAL,
        emailSent,
      },
    }
  }
}
