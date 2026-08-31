import type { PrismaClient } from '@prisma/client'
import nodemailer from 'nodemailer'
import { USER_CHANNELS, type FiscalJurisdictionCode } from '@bizcode/types'
import { hashPassword } from '../passwordHash'
import { validateTaxId } from '../../web/src/lib/validators'
import { isJurisdictionEnabled, resolveDefaultJurisdiction } from '../../web/src/lib/modules/jurisdictionEnv'
import { buildNewTenantFiscalDefaults } from '../services/tenantProvisioningDefaults'
import { mockConsultaPadronA4, normalizeCuitDigits } from '../fiscal/ar/arcaPadronMock'
import { isSmtpConfigured } from '../channels'
import { resolveSmtpTransportConfig } from '../config/smtpTransport'
import { logger } from '../logger'
import {
  SAAS_STATUS_TRIAL,
  SAAS_TRIAL_DAYS,
} from './saasStatus'
import { isValidTenantSlug, normalizeTenantSlug } from './tenantSlug'
import { isPlausibleEmail } from './emailCheck'

export type SaasRegisterInput = {
  businessName: string
  cuit: string
  /**
   * @en Tax jurisdiction chosen at registration (#437); omitted falls back to the installation default.
   * @es Jurisdicción fiscal elegida en el registro (#437); si se omite se usa el default de la instalación.
   * @pt-BR Jurisdição fiscal escolhida no registro (#437); se omitida usa o padrão da instalação.
   */
  jurisdiccionFiscal?: string
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

  /**
   * @en Narrows the requested jurisdiction to one enabled by the installation (#437); an absent value
   *   takes the installation default, and a disabled one is rejected instead of silently downgraded.
   * @es Estrecha la jurisdicción pedida a una habilitada por la instalación (#437); si falta se toma
   *   el default de la instalación, y una deshabilitada se rechaza en vez de degradarse en silencio.
   * @pt-BR Restringe a jurisdição solicitada a uma habilitada pela instalação (#437); ausente usa o
   *   padrão da instalação, e uma desabilitada é rejeitada em vez de rebaixada silenciosamente.
   */
  private resolveRequestedJurisdiction(requested?: string): FiscalJurisdictionCode | null {
    const trimmed = requested?.trim().toUpperCase()
    if (!trimmed) {
      return resolveDefaultJurisdiction()
    }
    return isJurisdictionEnabled(trimmed) ? trimmed : null
  }

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

    const jurisdiccionFiscal = this.resolveRequestedJurisdiction(input.jurisdiccionFiscal)
    if (!jurisdiccionFiscal) {
      return {
        ok: false,
        status: 400,
        error: 'Jurisdiction not enabled for this installation',
        code: 'JURISDICTION_NOT_ENABLED',
      }
    }

    const taxIdDigits = normalizeCuitDigits(input.cuit)
    if (!validateTaxId(taxIdDigits, jurisdiccionFiscal)) {
      return { ok: false, status: 400, error: 'Invalid tax id', code: 'INVALID_CUIT' }
    }

    /**
     * @en The ARCA registry lookup only exists for Argentina; elsewhere the company data is taken
     *   from the registration form (#437).
     * @es La consulta al padrón de ARCA solo existe para Argentina; en el resto los datos de la
     *   empresa se toman del formulario de registro (#437).
     * @pt-BR A consulta ao cadastro da ARCA só existe para a Argentina; nos demais os dados da
     *   empresa vêm do formulário de registro (#437).
     */
    const padron =
      jurisdiccionFiscal === 'AR'
        ? mockConsultaPadronA4(taxIdDigits)
        : ({ status: 'skipped' } as const)
    if (padron.status === 'timeout') {
      return {
        ok: false,
        status: 503,
        error: 'Tax registry lookup temporarily unavailable',
        code: 'PADRON_TIMEOUT',
      }
    }

    const email = input.email.trim().toLowerCase()
    if (!isPlausibleEmail(email)) {
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

      const fiscalDefaults = buildNewTenantFiscalDefaults(jurisdiccionFiscal)
      await tx.tenantConfig.create({
        data: {
          tenantId: tenant.id,
          businessType: 'ambos',
          rubros: [],
          plan: 'starter',
          modules: fiscalDefaults.modules,
          jurisdiccionFiscal: fiscalDefaults.jurisdiccionFiscal,
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
          cuit: taxIdDigits,
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
