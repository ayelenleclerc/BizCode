/**
 * @en Types for the pharmacy vertical MVP (#204): prescriptions and internal psychotropic book.
 * @es Tipos del MVP del vertical farmacia (#204): recetas y libro interno de psicotrópicos.
 * @pt-BR Tipos do MVP do vertical farmácia (#204): receitas e livro interno de psicotrópicos.
 */

export const LIBRO_PSICOTROPICO_TIPOS = ['ingreso', 'egreso', 'ajuste'] as const

export type LibroPsicotropicoTipo = (typeof LIBRO_PSICOTROPICO_TIPOS)[number]

export type RecetaDispensacionRow = {
  id: number
  tenantId: number
  facturaId: number | null
  clienteId: number | null
  numeroReceta: string
  medicoNombre: string
  matricula: string
  fechaReceta: string
  observaciones: string | null
  createdAt: string
  updatedAt: string
  cliente?: { id: number; rsocial: string } | null
}

export type RecetaDispensacionCreateInput = {
  facturaId?: number | null
  clienteId?: number | null
  numeroReceta: string
  medicoNombre: string
  matricula: string
  fechaReceta: string
  observaciones?: string | null
}

export type RecetaDispensacionListFilters = {
  facturaId?: number
  clienteId?: number
  desde?: string
  hasta?: string
}

export type LibroPsicotropicoMovimientoRow = {
  id: number
  tenantId: number
  articuloId: number
  loteId: number | null
  recetaId: number | null
  tipo: LibroPsicotropicoTipo
  cantidad: number
  referencia: string | null
  observaciones: string | null
  createdAt: string
  articulo?: { id: number; codigo: number; descripcion: string } | null
  lote?: { id: number; nroLote: string } | null
}

export type LibroPsicotropicoCreateInput = {
  articuloId: number
  loteId?: number | null
  recetaId?: number | null
  tipo: LibroPsicotropicoTipo
  cantidad: number
  referencia?: string | null
  observaciones?: string | null
}

export type LibroPsicotropicoListFilters = {
  articuloId?: number
  tipo?: LibroPsicotropicoTipo
  desde?: string
  hasta?: string
}

/**
 * @en Article flags that drive pharmacy dispensing controls (#204).
 * @es Flags de artículo que gobiernan los controles de dispensación (#204).
 * @pt-BR Flags do artigo que regem os controles de dispensação (#204).
 */
export type ArticuloFarmaciaFlags = {
  requiereReceta: boolean
  esPsicotropico: boolean
}

export type DispensacionGateResult =
  | { ok: true }
  | { ok: false; error: 'PRESCRIPTION_REQUIRED'; articuloIds: number[] }
