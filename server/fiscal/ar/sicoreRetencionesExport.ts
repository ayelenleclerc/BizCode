import { formatLibroIvaAmount, formatLibroIvaDate } from './libroIvaVentasFormat'

export type SicoreRetencionExportRow = {
  fecha: Date
  cuitRetenedor: string
  cuitRetenido: string
  regimenTipo: string
  baseImponible: number
  alicuota: number
  importe: number
  constanciaNum: string
}

const REGIMEN_CODE: Record<string, string> = {
  ganancias: '217',
  iva: '767',
}

/**
 * @en Fixed-width pipe TXT for SICORE withholding export (#276). Validate against AFIP layout manually.
 * @es TXT pipe de ancho fijo para export SICORE (#276). Validar layout AFIP manualmente.
 * @pt-BR TXT pipe para exportação SICORE (#276). Validar layout AFIP manualmente.
 */
export function buildSicoreRetencionesExport(rows: SicoreRetencionExportRow[]): string {
  const lines: string[] = []
  for (const row of rows) {
    const code = REGIMEN_CODE[row.regimenTipo] ?? '000'
    lines.push(
      [
        formatLibroIvaDate(row.fecha),
        row.cuitRetenedor.padStart(11, '0').slice(-11),
        row.cuitRetenido.padStart(11, '0').slice(-11),
        code,
        formatLibroIvaAmount(row.baseImponible),
        formatLibroIvaAmount(row.alicuota),
        formatLibroIvaAmount(row.importe),
        row.constanciaNum.slice(0, 30),
      ].join('|'),
    )
  }
  return lines.join('\n')
}
