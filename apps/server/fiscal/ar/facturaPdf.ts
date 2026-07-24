import type { PrismaClient } from '@prisma/client'
import type { ServiceResult } from '../../services/serviceResults'
import type { ArcaFacturaPdfInput, CondicionIvaCode } from './arcaFiscalPdfTypes'
import { buildFacturaPdfImages } from './facturaPdfImages'
import { renderFacturaPdfA4, renderFacturaTicket80mm } from './facturaPdfLayout'
import { FidelizacionService } from '../../services/FidelizacionService'

export type FacturaPdfOptions = {
  preview: boolean
}

function parseCondicionIva(value: string | null | undefined): CondicionIvaCode | null {
  if (value === 'RI' || value === 'Mono' || value === 'CF' || value === 'Exento') return value
  return null
}

async function attachLoyaltyFooter(
  prisma: PrismaClient,
  tenantId: number,
  factura: { id: number; clienteId: number | null },
  pdfInput: ArcaFacturaPdfInput,
): Promise<ArcaFacturaPdfInput> {
  if (factura.clienteId == null) return pdfInput
  const fidelizacion = new FidelizacionService(prisma)
  if (!(await fidelizacion.isLoyaltyEnabled(tenantId))) return pdfInput
  const summary = await fidelizacion.getClientePuntos(tenantId, factura.clienteId, 1, 0)
  if (!summary.ok) return pdfInput
  const earned = await prisma.movimientoPuntos.findFirst({
    where: {
      tenantId,
      clienteId: factura.clienteId,
      referenciaFacturaId: factura.id,
      tipo: 'acumulacion',
    },
    select: { puntos: true },
  })
  const earnedPts = earned?.puntos ?? 0
  const saldo = summary.data.puntos
  const equivalencia = summary.data.equivalenteDinero
  return {
    ...pdfInput,
    loyaltyFooter: `Puntos: +${earnedPts} | Saldo: ${saldo} (≈ $${equivalencia.toFixed(2)})`,
  }
}

function mapFacturaToPdfInput(
  empresaRow: {
    nombre: string
    cuit: string
    domicilio: string | null
    condicionIva: string
    ingresosBrutos: string | null
    fechaInicioActividades: Date | null
  } | null,
  factura: {
    tipo: string
    prefijo: string
    numero: number
    fecha: Date
    total: { toString: () => string }
    neto1: { toString: () => string }
    neto2: { toString: () => string }
    neto3: { toString: () => string }
    iva1: { toString: () => string }
    iva2: { toString: () => string }
    cae: string | null
    caeVto: Date | null
    tipoCambioValor?: { toString: () => string } | null
    tipoCambioMoneda?: string | null
    tipoCambioTipo?: string | null
    tipoCambioFecha?: Date | null
    cliente: {
      rsocial: string
      cuit: string | null
      domicilio: string | null
      condIva: string
    } | null
    items: Array<{
      cantidad: number
      precio: { toString: () => string }
      dscto: { toString: () => string }
      subtotal: { toString: () => string }
      descripcion?: string | null
      monedaOrigen?: string | null
      precioOrigen?: { toString: () => string } | null
      tipoCambioValor?: { toString: () => string } | null
      articulo: { descripcion: string } | null
    }>
    retencionesAplicadas?: Array<{
      importe: { toString: () => string }
      regimen: { nombre: string }
    }>
  },
  preview: boolean,
): ArcaFacturaPdfInput {
  return {
    preview,
    empresa: {
      nombre: empresaRow?.nombre ?? 'BizCode',
      cuit: empresaRow?.cuit ?? '',
      domicilio: empresaRow?.domicilio ?? null,
      condicionIva: parseCondicionIva(empresaRow?.condicionIva),
      ingresosBrutos: empresaRow?.ingresosBrutos ?? null,
      fechaInicioActividades: empresaRow?.fechaInicioActividades ?? null,
    },
    factura: {
      tipo: factura.tipo,
      prefijo: factura.prefijo,
      numero: factura.numero,
      fecha: factura.fecha,
      total: Number(factura.total),
      neto1: Number(factura.neto1),
      neto2: Number(factura.neto2),
      neto3: Number(factura.neto3),
      iva1: Number(factura.iva1),
      iva2: Number(factura.iva2),
      cae: factura.cae,
      caeVto: factura.caeVto,
      cliente: factura.cliente,
      items: factura.items.map((item) => ({
        cantidad: item.cantidad,
        precio: Number(item.precio),
        dscto: Number(item.dscto),
        subtotal: Number(item.subtotal),
        descripcion:
          (item.descripcion && item.descripcion.trim()) ||
          item.articulo?.descripcion ||
          '—',
        monedaOrigen: item.monedaOrigen ?? null,
        precioOrigen:
          item.precioOrigen != null ? Number(item.precioOrigen.toString()) : null,
        tipoCambioValor:
          item.tipoCambioValor != null ? Number(item.tipoCambioValor.toString()) : null,
      })),
      percepciones: (factura.retencionesAplicadas ?? []).map((row) => ({
        nombre: row.regimen.nombre,
        importe: Number(row.importe),
      })),
      tipoCambioValor:
        factura.tipoCambioValor != null ? Number(factura.tipoCambioValor.toString()) : null,
      tipoCambioMoneda: factura.tipoCambioMoneda ?? null,
      tipoCambioTipo: factura.tipoCambioTipo ?? null,
      tipoCambioFecha: factura.tipoCambioFecha ?? null,
    },
  }
}

/**
 * @en Builds invoice PDF (issued CAE or watermarked preview).
 * @es Genera PDF de factura (CAE emitido o vista previa con marca de agua).
 * @pt-BR Gera PDF da fatura (CAE emitido ou pré-visualização com marca d'água).
 */
export async function buildFacturaPdfBuffer(
  prisma: PrismaClient,
  tenantId: number,
  facturaId: number,
  options: FacturaPdfOptions,
): Promise<ServiceResult<Buffer>> {
  const factura = await prisma.factura.findFirst({
    where: { id: facturaId, tenantId },
    include: {
      cliente: true,
      items: { include: { articulo: true } },
      retencionesAplicadas: {
        where: { tipo: 'percepcion' },
        include: { regimen: { select: { nombre: true } } },
      },
    },
  })
  if (!factura) {
    return { ok: false, status: 404, error: 'Factura not found' }
  }

  if (!options.preview) {
    if (factura.estadoCae !== 'issued' || !factura.cae) {
      return { ok: false, status: 422, error: 'CAE_NOT_ISSUED' }
    }
  }

  const empresaRow = await prisma.paramEmpresa.findUnique({ where: { tenantId } })
  const pdfInput = await attachLoyaltyFooter(
    prisma,
    tenantId,
    factura,
    mapFacturaToPdfInput(empresaRow, factura, options.preview),
  )
  const images = await buildFacturaPdfImages(pdfInput)
  const buffer = await renderFacturaPdfA4(pdfInput, images)

  return { ok: true, data: buffer }
}

/**
 * @en Builds 80mm ticket PDF (operational; without CAE it is explicitly non-fiscal).
 * @es Genera ticket 80mm (operativo; sin CAE es explícitamente no fiscal).
 * @pt-BR Gera ticket 80mm (operacional; sem CAE é explicitamente não fiscal).
 */
export async function buildFacturaTicketPdfBuffer(
  prisma: PrismaClient,
  tenantId: number,
  facturaId: number,
): Promise<ServiceResult<Buffer>> {
  const factura = await prisma.factura.findFirst({
    where: { id: facturaId, tenantId },
    include: {
      cliente: true,
      items: { include: { articulo: true } },
      retencionesAplicadas: {
        where: { tipo: 'percepcion' },
        include: { regimen: { select: { nombre: true } } },
      },
    },
  })
  if (!factura) {
    return { ok: false, status: 404, error: 'Factura not found' }
  }

  const hasIssuedCae = factura.estadoCae === 'issued' && !!factura.cae
  const empresaRow = await prisma.paramEmpresa.findUnique({ where: { tenantId } })
  const pdfInput = await attachLoyaltyFooter(
    prisma,
    tenantId,
    factura,
    mapFacturaToPdfInput(empresaRow, factura, !hasIssuedCae),
  )
  const buffer = await renderFacturaTicket80mm(pdfInput)

  return { ok: true, data: buffer }
}

export function facturaPdfFilename(facturaId: number, preview: boolean): string {
  return preview ? `factura-${facturaId}-preview.pdf` : `factura-${facturaId}.pdf`
}

export function facturaTicketPdfFilename(facturaId: number): string {
  return `factura-${facturaId}-ticket.pdf`
}
