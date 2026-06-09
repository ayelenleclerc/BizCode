/**
 * @en Placeholder withholding preview — full calculation in #229.
 * @es Vista previa de retenciones placeholder — cálculo completo en #229.
 * @pt-BR Pré-visualização de retenções placeholder — cálculo completo em #229.
 */
export type RetencionPreviewInput = {
  entidadTipo: 'cliente' | 'proveedor'
  entidadId: number
  monto: number
}

export type RetencionPreviewLine = {
  regimenId: number
  nombre: string
  tipo: string
  alicuota: string
  baseImponible: string
  importe: string
}

export function previewRetencionesStub(_input: RetencionPreviewInput): RetencionPreviewLine[] {
  return []
}
