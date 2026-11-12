/**
 * @en FCEM MiPyME service — local detection + homologación mock WSFECM (#239). Live AFIP Not evidenced.
 * @es Servicio FCEM MiPyME — detección local + mock WSFECM de homologación (#239). AFIP live no evidenciado.
 * @pt-BR Serviço FCEM MiPyME — detecção local + mock WSFECM de homologação (#239). AFIP live não evidenciado.
 */

import type { PrismaClient } from '@prisma/client'
import {
  evaluateFcemRequirement,
  isFcemEstado,
  type FcemDetectionResult,
  type FcemEstado,
} from '@bizcode/types'
import type { ServiceResult } from '../../services/serviceResults'
import { mockRequestFcemCae } from './arcaWsfecmMock'

export type FcemStatusDto = {
  facturaId: number
  fcemEstado: FcemEstado | null
  fcemTipoCbte: number | null
  fcemPlazoPagoDias: number | null
  fcemRejectReason: string | null
  fcemEmittedAt: string | null
  fcemResolvedAt: string | null
  cae: string | null
  caeVto: string | null
  detection: FcemDetectionResult
}

function decimalToNumber(value: { toString(): string } | number | null | undefined): number {
  if (value == null) return 0
  return typeof value === 'number' ? value : Number(value.toString())
}

function toIso(value: Date | null | undefined): string | null {
  return value ? value.toISOString() : null
}

export class FcemService {
  constructor(private readonly prisma: PrismaClient) {}

  /**
   * @en Evaluates whether a factura requires FCEM under local MiPyME rules.
   * @es Evalúa si una factura requiere FCEM bajo las reglas locales MiPyME.
   * @pt-BR Avalia se uma fatura exige FCEM sob as regras locais MiPyME.
   */
  async evaluate(tenantId: number, facturaId: number): Promise<ServiceResult<FcemStatusDto>> {
    const loaded = await this.loadFacturaContext(tenantId, facturaId)
    if (!loaded.ok) return loaded
    return { ok: true, data: this.toStatus(loaded.data.factura, loaded.data.detection) }
  }

  /**
   * @en Emits FCEM via mock WSFECM when detection requires it; sets pendiente_aceptacion.
   * @es Emite FCEM vía mock WSFECM cuando la detección lo exige; deja pendiente_aceptacion.
   * @pt-BR Emite FCEM via mock WSFECM quando a detecção exige; define pendiente_aceptacion.
   */
  async emit(tenantId: number, facturaId: number): Promise<ServiceResult<FcemStatusDto>> {
    const loaded = await this.loadFacturaContext(tenantId, facturaId)
    if (!loaded.ok) return loaded
    const { factura, detection, plazoPagoDias } = loaded.data

    if (!detection.required || detection.fcemTipoCbte == null) {
      return { ok: false, status: 422, error: 'FCEM_NOT_REQUIRED' }
    }
    if (factura.fcemEstado && factura.fcemEstado !== 'pendiente_aceptacion') {
      return { ok: false, status: 422, error: 'FCEM_ALREADY_RESOLVED' }
    }
    if (factura.estadoCae === 'issued' && factura.fcemEstado === 'pendiente_aceptacion') {
      return { ok: false, status: 422, error: 'FCEM_ALREADY_EMITTED' }
    }

    try {
      const auth = mockRequestFcemCae(factura.id, decimalToNumber(factura.total), detection.fcemTipoCbte)
      const now = new Date()
      const updated = await this.prisma.factura.update({
        where: { id: factura.id },
        data: {
          cae: auth.cae,
          caeVto: auth.caeVto,
          estadoCae: 'issued',
          fcemEstado: 'pendiente_aceptacion',
          fcemTipoCbte: auth.fcemTipoCbte,
          fcemPlazoPagoDias: plazoPagoDias,
          fcemEmittedAt: now,
          fcemResolvedAt: null,
          fcemRejectReason: null,
        },
      })
      return {
        ok: true,
        data: this.toStatus(updated, detection),
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err)
      return { ok: false, status: 422, error: message }
    }
  }

  /**
   * @en Marks receptor acceptance (local only; live AFIP ConsultaObligado Not evidenced).
   * @es Marca aceptación del receptor (solo local; ConsultaObligado AFIP live no evidenciado).
   * @pt-BR Marca aceitação do receptor (apenas local; ConsultaObligado AFIP live não evidenciado).
   */
  async accept(tenantId: number, facturaId: number): Promise<ServiceResult<FcemStatusDto>> {
    return this.resolveEstado(tenantId, facturaId, 'aceptada')
  }

  /**
   * @en Marks receptor rejection with optional reason (local only).
   * @es Marca rechazo del receptor con motivo opcional (solo local).
   * @pt-BR Marca rejeição do receptor com motivo opcional (apenas local).
   */
  async reject(
    tenantId: number,
    facturaId: number,
    reason?: string,
  ): Promise<ServiceResult<FcemStatusDto>> {
    return this.resolveEstado(tenantId, facturaId, 'rechazada_por_receptor', reason?.trim() || null)
  }

  /**
   * @en Simulates tacit acceptance after the legal window (local test helper; no calendar job).
   * @es Simula aceptación tácita tras la ventana legal (helper de prueba local; sin job de calendario).
   * @pt-BR Simula aceitação tácita após a janela legal (helper de teste local; sem job de calendário).
   */
  async acceptTacita(tenantId: number, facturaId: number): Promise<ServiceResult<FcemStatusDto>> {
    return this.resolveEstado(tenantId, facturaId, 'aceptada_tacita')
  }

  private async resolveEstado(
    tenantId: number,
    facturaId: number,
    next: Exclude<FcemEstado, 'pendiente_aceptacion'>,
    rejectReason: string | null = null,
  ): Promise<ServiceResult<FcemStatusDto>> {
    const loaded = await this.loadFacturaContext(tenantId, facturaId)
    if (!loaded.ok) return loaded
    const { factura, detection } = loaded.data

    if (factura.fcemEstado !== 'pendiente_aceptacion') {
      return { ok: false, status: 422, error: 'FCEM_NOT_PENDING' }
    }

    const updated = await this.prisma.factura.update({
      where: { id: factura.id },
      data: {
        fcemEstado: next,
        fcemResolvedAt: new Date(),
        fcemRejectReason: next === 'rechazada_por_receptor' ? rejectReason : null,
      },
    })
    return { ok: true, data: this.toStatus(updated, detection) }
  }

  private async loadFacturaContext(
    tenantId: number,
    facturaId: number,
  ): Promise<
    ServiceResult<{
      factura: {
        id: number
        total: { toString(): string } | number
        tipo: string
        estadoCae: string
        cae: string | null
        caeVto: Date | null
        fcemEstado: string | null
        fcemTipoCbte: number | null
        fcemPlazoPagoDias: number | null
        fcemRejectReason: string | null
        fcemEmittedAt: Date | null
        fcemResolvedAt: Date | null
        cliente: { condIva: string; creditDays: number }
      }
      detection: FcemDetectionResult
      plazoPagoDias: number
    }>
  > {
    const [factura, empresa] = await Promise.all([
      this.prisma.factura.findFirst({
        where: { id: facturaId, tenantId },
        select: {
          id: true,
          total: true,
          tipo: true,
          estadoCae: true,
          cae: true,
          caeVto: true,
          fcemEstado: true,
          fcemTipoCbte: true,
          fcemPlazoPagoDias: true,
          fcemRejectReason: true,
          fcemEmittedAt: true,
          fcemResolvedAt: true,
          cliente: { select: { condIva: true, creditDays: true } },
        },
      }),
      this.prisma.paramEmpresa.findUnique({
        where: { tenantId },
        select: { esMipyme: true, fcemUmbralMonto: true },
      }),
    ])

    if (!factura) return { ok: false, status: 404, error: 'Factura not found' }

    const plazoPagoDias = factura.fcemPlazoPagoDias ?? factura.cliente.creditDays
    const umbralRaw = empresa?.fcemUmbralMonto
    const umbralMonto =
      umbralRaw == null ? null : decimalToNumber(umbralRaw as { toString(): string } | number)

    const detection = evaluateFcemRequirement({
      esMipyme: empresa?.esMipyme === true,
      clienteCondIva: factura.cliente.condIva,
      facturaTipo: factura.tipo,
      facturaTotal: decimalToNumber(factura.total),
      plazoPagoDias,
      umbralMonto,
    })

    return { ok: true, data: { factura, detection, plazoPagoDias } }
  }

  private toStatus(
    factura: {
      id: number
      cae: string | null
      caeVto: Date | null
      fcemEstado: string | null
      fcemTipoCbte: number | null
      fcemPlazoPagoDias: number | null
      fcemRejectReason: string | null
      fcemEmittedAt: Date | null
      fcemResolvedAt: Date | null
    },
    detection: FcemDetectionResult,
  ): FcemStatusDto {
    return {
      facturaId: factura.id,
      fcemEstado: isFcemEstado(factura.fcemEstado) ? factura.fcemEstado : null,
      fcemTipoCbte: factura.fcemTipoCbte,
      fcemPlazoPagoDias: factura.fcemPlazoPagoDias,
      fcemRejectReason: factura.fcemRejectReason,
      fcemEmittedAt: toIso(factura.fcemEmittedAt),
      fcemResolvedAt: toIso(factura.fcemResolvedAt),
      cae: factura.cae,
      caeVto: toIso(factura.caeVto),
      detection,
    }
  }
}
