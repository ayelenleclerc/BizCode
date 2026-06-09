/** @en AFIP RG 3685 sales book tipo comprobante codes (Libro IVA Ventas digital). */

export const TIPO_FACTURA_ARCA: Readonly<Record<string, string>> = {
  A: '001',
  B: '006',
  C: '011',
}

export const TIPO_NC_ARCA: Readonly<Record<string, string>> = {
  A: '003',
  B: '008',
  C: '013',
}

/** @en Voided voucher registration in sales book (#147 AC). */
export const TIPO_ANULADO_ARCA = '999'

export const ALICUOTA_IVA_21 = '0005'
export const ALICUOTA_IVA_105 = '0004'
export const ALICUOTA_IVA_0 = '0003'

export const COD_DOC_CUIT = '80'
export const COD_DOC_CF = '99'
export const COD_MONEDA_PES = 'PES'
export const COD_OPERACION_NORMAL = '0'
