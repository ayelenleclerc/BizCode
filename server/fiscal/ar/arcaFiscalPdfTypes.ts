/**
 * @en Shared types for AFIP-aligned invoice PDF generation (#148).
 * @es Tipos compartidos para PDF de factura alineado AFIP (#148).
 * @pt-BR Tipos compartilhados para PDF de fatura alinhado AFIP (#148).
 */

export type CondicionIvaCode = 'RI' | 'Mono' | 'CF' | 'Exento'

export type ArcaFacturaPdfInput = {
  empresa: {
    nombre: string
    cuit: string
    domicilio: string | null
    condicionIva: CondicionIvaCode | null
    ingresosBrutos: string | null
    fechaInicioActividades: Date | null
  }
  factura: {
    tipo: string
    prefijo: string
    numero: number
    fecha: Date
    total: number
    neto1: number
    neto2: number
    neto3: number
    iva1: number
    iva2: number
    cae: string | null
    caeVto: Date | null
    cliente: {
      rsocial: string
      cuit: string | null
      domicilio: string | null
      condIva: string
    } | null
    items: Array<{
      cantidad: number
      precio: number
      dscto: number
      subtotal: number
      descripcion: string
    }>
    percepciones: Array<{
      nombre: string
      importe: number
    }>
  }
  preview: boolean
}
