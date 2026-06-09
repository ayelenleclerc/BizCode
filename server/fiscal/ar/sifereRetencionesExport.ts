import { formatLibroIvaAmount, formatLibroIvaDate } from './libroIvaVentasFormat'

export type SifereRetencionExportRow = {
  fecha: Date
  cuitRetenedor: string
  cuitRetenido: string
  regimenTipo: string
  provincia: string | null
  baseImponible: number
  alicuota: number
  importe: number
  constanciaNum: string
}

/**
 * @en Fixed-width pipe TXT for SIFERE IIBB withholding export (#276). Validate against provincial layout manually.
 * @es TXT pipe para export SIFERE IIBB (#276). Validar layout provincial manualmente.
 * @pt-BR TXT pipe para exportação SIFERE IIBB (#276). Validar layout provincial manualmente.
 */
export function buildSifereRetencionesExport(rows: SifereRetencionExportRow[]): string {
  const lines: string[] = []
  for (const row of rows) {
    lines.push(
      [
        formatLibroIvaDate(row.fecha),
        row.cuitRetenedor.padStart(11, '0').slice(-11),
        row.cuitRetenido.padStart(11, '0').slice(-11),
        (row.provincia ?? '').slice(0, 10),
        formatLibroIvaAmount(row.baseImponible),
        formatLibroIvaAmount(row.alicuota),
        formatLibroIvaAmount(row.importe),
        row.constanciaNum.slice(0, 30),
      ].join('|'),
    )
  }
  return lines.join('\n')
}
