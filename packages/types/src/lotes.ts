/**
 * @en Types for FEFO inventory lots (#202).
 * @es Tipos de lotes de inventario FEFO (#202).
 * @pt-BR Tipos de lotes de inventário FEFO (#202).
 */

export type ConfigFefoRow = {
  id: number
  tenantId: number
  diasAlertaVencimiento: number
  createdAt: string
  updatedAt: string
}

export type ConfigFefoUpsertInput = {
  diasAlertaVencimiento: number
}

export type LoteRow = {
  id: number
  tenantId: number
  articuloId: number
  depositoId: number
  proveedorId: number | null
  nroLote: string
  fechaVencimiento: string
  fechaIngreso: string
  stockInicial: number
  stockActual: number
  activo: boolean
  preavisoEnviadoAt: string | null
  createdAt: string
  updatedAt: string
  articulo?: { id: number; codigo: number; descripcion: string } | null
  deposito?: { id: number; codigo: string; nombre: string } | null
}

export type LoteTrazabilidadFactura = {
  facturaId: number
  facturaItemId: number
  tipo: string
  prefijo: string
  numero: number
  fecha: string
  cantidad: number
  clienteId: number | null
  clienteRsocial: string | null
}

export type LoteTrazabilidad = {
  lote: LoteRow
  facturas: LoteTrazabilidadFactura[]
}

export type FefoAllocation = {
  loteId: number
  nroLote: string
  fechaVencimiento: string
  cantidad: number
}
