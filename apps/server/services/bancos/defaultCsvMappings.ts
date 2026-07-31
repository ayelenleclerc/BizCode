/**
 * @en Default CSV column mappings for common Argentine banks (#190).
 * @es Mapeos CSV por defecto para bancos argentinos habituales (#190).
 * @pt-BR Mapeamentos CSV padrão para bancos argentinos comuns (#190).
 */
export type DefaultBancoCsvMapping = {
  bancoCode: string
  columnaFecha: string
  columnaDescripcion: string
  columnaImporte: string
  columnaReferencia: string | null
  columnaSaldo: string | null
  separadorDecimal: string
  formatoFecha: string
  delimiter: string
  signoDebitoCredito: string
}

export const DEFAULT_BANCO_CSV_MAPPINGS: readonly DefaultBancoCsvMapping[] = [
  {
    bancoCode: 'galicia',
    columnaFecha: 'Fecha',
    columnaDescripcion: 'Descripcion',
    columnaImporte: 'Importe',
    columnaReferencia: 'Comprobante',
    columnaSaldo: 'Saldo',
    separadorDecimal: ',',
    formatoFecha: 'dd/MM/yyyy',
    delimiter: ';',
    signoDebitoCredito: 'signed_importe',
  },
  {
    bancoCode: 'santander',
    columnaFecha: 'Fecha',
    columnaDescripcion: 'Concepto',
    columnaImporte: 'Importe',
    columnaReferencia: 'Referencia',
    columnaSaldo: 'Saldo',
    separadorDecimal: ',',
    formatoFecha: 'dd/MM/yyyy',
    delimiter: ';',
    signoDebitoCredito: 'signed_importe',
  },
  {
    bancoCode: 'bbva',
    columnaFecha: 'Fecha',
    columnaDescripcion: 'Descripcion',
    columnaImporte: 'Importe',
    columnaReferencia: 'Nro. operacion',
    columnaSaldo: 'Saldo',
    separadorDecimal: ',',
    formatoFecha: 'dd/MM/yyyy',
    delimiter: ';',
    signoDebitoCredito: 'signed_importe',
  },
  {
    bancoCode: 'macro',
    columnaFecha: 'Fecha',
    columnaDescripcion: 'Detalle',
    columnaImporte: 'Monto',
    columnaReferencia: 'Referencia',
    columnaSaldo: 'Saldo',
    separadorDecimal: ',',
    formatoFecha: 'dd/MM/yyyy',
    delimiter: ';',
    signoDebitoCredito: 'signed_importe',
  },
  {
    bancoCode: 'nacion',
    columnaFecha: 'Fecha',
    columnaDescripcion: 'Descripcion',
    columnaImporte: 'Importe',
    columnaReferencia: 'Nro Comprobante',
    columnaSaldo: 'Saldo',
    separadorDecimal: ',',
    formatoFecha: 'dd/MM/yyyy',
    delimiter: ';',
    signoDebitoCredito: 'signed_importe',
  },
] as const
