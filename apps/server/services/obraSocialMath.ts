/**
 * @en Pure copay / insurer-credit math for pharmacy OS sales (#252).
 * @es Matemática pura de copago / crédito OS para ventas de farmacia (#252).
 * @pt-BR Matemática pura de copago / crédito do plano para vendas de farmácia (#252).
 */

import type { OsTipoProducto } from '@bizcode/types'
import { OS_TIPO_PRODUCTOS } from '@bizcode/types'

export type OsLineInput = {
  descripcion: string
  tipoProducto: OsTipoProducto
  cantidad: number
  precioUnitario: number
  articuloId?: number | null
}

export type OsLineComputed = OsLineInput & {
  subtotal: number
  coberturaPct: number
  creditoOS: number
  copago: number
}

export type OsSaleComputed = {
  lines: OsLineComputed[]
  totalVenta: number
  creditoOS: number
  copagoPaciente: number
}

const MONEY_EPS = 0.005

export function isOsTipoProducto(value: string): value is OsTipoProducto {
  return (OS_TIPO_PRODUCTOS as readonly string[]).includes(value)
}

export function roundMoney(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100
}

/**
 * @en Resolve coverage percent for a product type; missing coverage means 0%.
 * @es Resuelve el % de cobertura por tipo; sin cobertura implica 0%.
 * @pt-BR Resolve o % de cobertura por tipo; sem cobertura implica 0%.
 */
export function coveragePctForTipo(
  map: ReadonlyMap<OsTipoProducto, number>,
  tipo: OsTipoProducto,
): number {
  const raw = map.get(tipo)
  if (raw === undefined || !Number.isFinite(raw)) return 0
  if (raw < 0) return 0
  if (raw > 100) return 100
  return raw
}

export function computeOsSale(
  items: ReadonlyArray<OsLineInput>,
  coverageByTipo: ReadonlyMap<OsTipoProducto, number>,
): { ok: true; data: OsSaleComputed } | { ok: false; error: string } {
  if (items.length === 0) return { ok: false, error: 'items must not be empty' }

  const lines: OsLineComputed[] = []
  let totalVenta = 0
  let creditoOS = 0
  let copagoPaciente = 0

  for (const item of items) {
    if (!item.descripcion.trim()) return { ok: false, error: 'item descripcion is required' }
    if (!isOsTipoProducto(item.tipoProducto)) {
      return { ok: false, error: `invalid tipoProducto: ${item.tipoProducto}` }
    }
    if (!Number.isFinite(item.cantidad) || item.cantidad <= 0) {
      return { ok: false, error: 'item cantidad must be a positive number' }
    }
    if (!Number.isFinite(item.precioUnitario) || item.precioUnitario < 0) {
      return { ok: false, error: 'item precioUnitario must be a non-negative number' }
    }

    const subtotal = roundMoney(item.cantidad * item.precioUnitario)
    const coberturaPct = coveragePctForTipo(coverageByTipo, item.tipoProducto)
    const credito = roundMoney((subtotal * coberturaPct) / 100)
    const copago = roundMoney(subtotal - credito)
    if (Math.abs(copago + credito - subtotal) > MONEY_EPS) {
      return { ok: false, error: 'copay/credit split failed rounding check' }
    }

    lines.push({
      ...item,
      descripcion: item.descripcion.trim(),
      subtotal,
      coberturaPct,
      creditoOS: credito,
      copago,
    })
    totalVenta = roundMoney(totalVenta + subtotal)
    creditoOS = roundMoney(creditoOS + credito)
    copagoPaciente = roundMoney(copagoPaciente + copago)
  }

  return {
    ok: true,
    data: {
      lines,
      totalVenta,
      creditoOS,
      copagoPaciente,
    },
  }
}

/**
 * @en Build internal CSV for a monthly OS presentation (#252); not proprietary OS formats.
 * @es Arma CSV interno de presentación mensual OS (#252); no es formato propietario.
 * @pt-BR Monta CSV interno de apresentação mensal (#252); não é formato proprietário.
 */
export function buildPresentacionOsCsv(
  rows: ReadonlyArray<{
    ventaId: number
    fecha: string
    nroAfiliado: string
    nroReceta: string
    totalVenta: number
    creditoOS: number
    copagoPaciente: number
  }>,
): string {
  const header = [
    'ventaId',
    'fecha',
    'nroAfiliado',
    'nroReceta',
    'totalVenta',
    'creditoOS',
    'copagoPaciente',
  ].join(',')
  const body = rows.map((r) =>
    [
      r.ventaId,
      r.fecha,
      csvEscape(r.nroAfiliado),
      csvEscape(r.nroReceta),
      r.totalVenta.toFixed(2),
      r.creditoOS.toFixed(2),
      r.copagoPaciente.toFixed(2),
    ].join(','),
  )
  return [header, ...body].join('\n')
}

function csvEscape(value: string): string {
  if (!value.includes(',') && !value.includes('"') && !value.includes('\n')) return value
  return `"${value.replace(/"/g, '""')}"`
}

export function isPeriodoYm(value: string): boolean {
  return /^\d{4}-(0[1-9]|1[0-2])$/.test(value)
}
