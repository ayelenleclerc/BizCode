/**
 * @en AFIP Padrón A4 lookup with 24h Prisma cache (#192).
 * @es Consulta Padrón A4 AFIP con caché Prisma de 24h (#192).
 * @pt-BR Consulta Padrón A4 AFIP com cache Prisma de 24h (#192).
 */
import type { Prisma, PrismaClient } from '@prisma/client'
import { validateCUIT } from '../../../web/src/lib/validators'
import type { ServiceResult } from '../../services/serviceResults'
import {
  mapAfipImpuestoToCondIva,
  mockConsultaPadronA4,
  normalizeCuitDigits,
  type PadronA4Persona,
  type PadronCondIva,
} from './arcaPadronMock'
import { decryptFiscalSecret } from './fiscalSecrets'

export const PADRON_CACHE_TTL_MS = 24 * 60 * 60 * 1000

export type PadronA4Reason = 'ok' | 'invalid_cuit' | 'not_found' | 'unavailable' | 'timeout'

export type PadronA4ConsultaDto = {
  cuit: string
  verificado: boolean
  available: boolean
  reason: PadronA4Reason
  fromCache: boolean
  fetchedAt: string | null
  razonSocial: string | null
  /** Truncated to 30 chars for Cliente.rsocial; full name when longer. */
  razonSocialTruncada: string | null
  razonSocialTruncadaFlag: boolean
  domicilio: string | null
  localidad: string | null
  cpost: string | null
  condIva: PadronCondIva | null
  estado: 'activo' | 'inactivo' | null
  categoriaMonotributo: string | null
}

type CachedPayload = {
  verificado: boolean
  reason: PadronA4Reason
  razonSocial: string | null
  domicilio: string | null
  localidad: string | null
  cpost: string | null
  condIva: PadronCondIva | null
  estado: 'activo' | 'inactivo' | null
  categoriaMonotributo: string | null
}

function truncateRazonSocial(value: string | null): {
  truncated: string | null
  flag: boolean
} {
  if (value == null) return { truncated: null, flag: false }
  if (value.length <= 30) return { truncated: value, flag: false }
  return { truncated: value.slice(0, 30), flag: true }
}

function personaToCache(persona: PadronA4Persona): CachedPayload {
  return {
    verificado: true,
    reason: 'ok',
    razonSocial: persona.razonSocial,
    domicilio: persona.domicilio,
    localidad: persona.localidad,
    cpost: persona.cpost,
    condIva: persona.condIva,
    estado: persona.estado,
    categoriaMonotributo: persona.categoriaMonotributo,
  }
}

function toDto(
  cuit: string,
  payload: CachedPayload,
  fromCache: boolean,
  fetchedAt: Date | null,
): PadronA4ConsultaDto {
  const { truncated, flag } = truncateRazonSocial(payload.razonSocial)
  return {
    cuit,
    verificado: payload.verificado,
    available: payload.reason === 'ok' || payload.reason === 'not_found',
    reason: payload.reason,
    fromCache,
    fetchedAt: fetchedAt?.toISOString() ?? null,
    razonSocial: payload.razonSocial,
    razonSocialTruncada: truncated,
    razonSocialTruncadaFlag: flag,
    domicilio: payload.domicilio,
    localidad: payload.localidad,
    cpost: payload.cpost,
    condIva: payload.condIva,
    estado: payload.estado,
    categoriaMonotributo: payload.categoriaMonotributo,
  }
}

function emptyDto(cuit: string, reason: PadronA4Reason): PadronA4ConsultaDto {
  return toDto(
    cuit,
    {
      verificado: false,
      reason,
      razonSocial: null,
      domicilio: null,
      localidad: null,
      cpost: null,
      condIva: null,
      estado: null,
      categoriaMonotributo: null,
    },
    false,
    null,
  )
}

export type PadronA4ServiceOptions = {
  /** When true, mock always returns timeout (tests). */
  forceTimeout?: boolean
}

export class PadronA4Service {
  constructor(
    private readonly prisma: PrismaClient,
    private readonly options: PadronA4ServiceOptions = {},
  ) {}

  /**
   * @en Looks up a CUIT in Padrón A4 (cache → homologación mock). Never blocks customer form.
   * @es Consulta un CUIT en Padrón A4 (caché → mock homologación). Nunca bloquea el formulario.
   * @pt-BR Consulta um CUIT no Padrón A4 (cache → mock homologação). Nunca bloqueia o formulário.
   */
  async consulta(
    tenantId: number,
    cuitRaw: string,
    opts?: { moduleEnabled?: boolean },
  ): Promise<ServiceResult<PadronA4ConsultaDto>> {
    const cuit = normalizeCuitDigits(cuitRaw)
    if (!validateCUIT(cuit)) {
      return { ok: true, data: emptyDto(cuit || cuitRaw, 'invalid_cuit') }
    }

    if (opts?.moduleEnabled === false) {
      return { ok: true, data: emptyDto(cuit, 'unavailable') }
    }

    const now = new Date()
    const cached = await this.prisma.padronA4Cache.findUnique({
      where: { tenantId_cuit: { tenantId, cuit } },
    })
    if (cached && cached.expiresAt > now) {
      const payload = cached.payload as CachedPayload
      return { ok: true, data: toDto(cuit, payload, true, cached.fetchedAt) }
    }

    const config = await this.prisma.tenantFiscalConfig.findUnique({ where: { tenantId } })
    if (!config) {
      return { ok: true, data: emptyDto(cuit, 'unavailable') }
    }

    // Touch secrets like ArcaService.getTa (homologación path); live SOAP out of scope.
    try {
      void decryptFiscalSecret(config.certEncrypted)
      void decryptFiscalSecret(config.keyEncrypted)
    } catch {
      return { ok: true, data: emptyDto(cuit, 'unavailable') }
    }

    const mock = mockConsultaPadronA4(cuit, { forceTimeout: this.options.forceTimeout })
    if (mock.status === 'timeout') {
      return { ok: true, data: emptyDto(cuit, 'timeout') }
    }

    let payload: CachedPayload
    if (mock.status === 'not_found') {
      payload = {
        verificado: false,
        reason: 'not_found',
        razonSocial: null,
        domicilio: null,
        localidad: null,
        cpost: null,
        condIva: null,
        estado: null,
        categoriaMonotributo: null,
      }
    } else {
      // Demonstrate mapper is available for future live SOAP payloads.
      void mapAfipImpuestoToCondIva(mock.persona.condIva)
      payload = personaToCache(mock.persona)
    }

    const fetchedAt = now
    const expiresAt = new Date(now.getTime() + PADRON_CACHE_TTL_MS)
    await this.prisma.padronA4Cache.upsert({
      where: { tenantId_cuit: { tenantId, cuit } },
      create: {
        tenantId,
        cuit,
        payload: payload as Prisma.InputJsonValue,
        fetchedAt,
        expiresAt,
      },
      update: {
        payload: payload as Prisma.InputJsonValue,
        fetchedAt,
        expiresAt,
      },
    })

    return { ok: true, data: toDto(cuit, payload, false, fetchedAt) }
  }
}
