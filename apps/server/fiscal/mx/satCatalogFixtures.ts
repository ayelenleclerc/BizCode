/**
 * @en Curated subset of public SAT CFDI 4.0 catalog codes for searchable seed (#210).
 *   Not the full SAT publication (~80k ClaveProdServ). Source: SAT c_ClaveProdServ /
 *   c_ClaveUnidad / c_FormaPago / c_MetodoPago / c_UsoCFDI / c_RegimenFiscal common rows.
 * @es Subconjunto curado de códigos públicos del catálogo SAT CFDI 4.0 para seed buscable (#210).
 *   No es la publicación completa (~80k ClaveProdServ). Fuente: filas habituales SAT.
 * @pt-BR Subconjunto curado de códigos públicos do catálogo SAT CFDI 4.0 para seed pesquisável (#210).
 *   Não é a publicação completa (~80k ClaveProdServ). Fonte: linhas habituais do SAT.
 */

export const SAT_CATALOG_NAMES = [
  'ClaveProdServ',
  'ClaveUnidad',
  'FormaPago',
  'MetodoPago',
  'UsoCFDI',
  'RegimenFiscal',
] as const

export type SatCatalogName = (typeof SAT_CATALOG_NAMES)[number]

export type SatCatalogFixtureRow = {
  catalog: SatCatalogName
  code: string
  description: string
}

/** @en Official SAT cancel reasons for CFDI 4.0 (#210). */
export const SAT_CFDI_CANCEL_REASON_CODES = ['01', '02', '03', '04'] as const
export type SatCfdiCancelReasonCode = (typeof SAT_CFDI_CANCEL_REASON_CODES)[number]

export function isSatCfdiCancelReasonCode(value: unknown): value is SatCfdiCancelReasonCode {
  return typeof value === 'string' && (SAT_CFDI_CANCEL_REASON_CODES as readonly string[]).includes(value)
}

export const SAT_CATALOG_SOURCE_LABEL = 'sat-cfdi-4.0-curated-2026-09'

/**
 * @en Representative public codes (food, medicine, general services, payment forms).
 * @es Códigos públicos representativos (alimentos, medicinas, servicios, formas de pago).
 * @pt-BR Códigos públicos representativos (alimentos, medicamentos, serviços, formas de pagamento).
 */
export const SAT_CATALOG_FIXTURES: readonly SatCatalogFixtureRow[] = [
  { catalog: 'ClaveProdServ', code: '01010101', description: 'No existe en el catálogo' },
  { catalog: 'ClaveProdServ', code: '10101500', description: 'Animales vivos de granja' },
  { catalog: 'ClaveProdServ', code: '50111500', description: 'Carne y aves de corral' },
  { catalog: 'ClaveProdServ', code: '50131700', description: 'Productos de panadería' },
  { catalog: 'ClaveProdServ', code: '50181900', description: 'Agua embotellada' },
  { catalog: 'ClaveProdServ', code: '51101500', description: 'Medicamentos' },
  { catalog: 'ClaveProdServ', code: '52161500', description: 'Equipo de cómputo' },
  { catalog: 'ClaveProdServ', code: '78101500', description: 'Transporte de carga por carretera' },
  { catalog: 'ClaveProdServ', code: '80101500', description: 'Servicios de consultoría de negocios' },
  { catalog: 'ClaveProdServ', code: '81111500', description: 'Ingeniería de software / sistemas' },
  { catalog: 'ClaveProdServ', code: '84111500', description: 'Contabilidad y auditoría' },
  { catalog: 'ClaveProdServ', code: '90101500', description: 'Restaurantes' },
  { catalog: 'ClaveUnidad', code: 'H87', description: 'Pieza' },
  { catalog: 'ClaveUnidad', code: 'E48', description: 'Unidad de servicio' },
  { catalog: 'ClaveUnidad', code: 'KGM', description: 'Kilogramo' },
  { catalog: 'ClaveUnidad', code: 'LTR', description: 'Litro' },
  { catalog: 'ClaveUnidad', code: 'MTR', description: 'Metro' },
  { catalog: 'ClaveUnidad', code: 'XBX', description: 'Caja' },
  { catalog: 'ClaveUnidad', code: 'ACT', description: 'Actividad' },
  { catalog: 'FormaPago', code: '01', description: 'Efectivo' },
  { catalog: 'FormaPago', code: '02', description: 'Cheque nominativo' },
  { catalog: 'FormaPago', code: '03', description: 'Transferencia electrónica de fondos' },
  { catalog: 'FormaPago', code: '04', description: 'Tarjeta de crédito' },
  { catalog: 'FormaPago', code: '28', description: 'Tarjeta de débito' },
  { catalog: 'FormaPago', code: '99', description: 'Por definir' },
  { catalog: 'MetodoPago', code: 'PUE', description: 'Pago en una sola exhibición' },
  { catalog: 'MetodoPago', code: 'PPD', description: 'Pago en parcialidades o diferido' },
  { catalog: 'UsoCFDI', code: 'G01', description: 'Adquisición de mercancías' },
  { catalog: 'UsoCFDI', code: 'G03', description: 'Gastos en general' },
  { catalog: 'UsoCFDI', code: 'S01', description: 'Sin efectos fiscales' },
  { catalog: 'UsoCFDI', code: 'CP01', description: 'Pagos' },
  { catalog: 'RegimenFiscal', code: '601', description: 'General de Ley Personas Morales' },
  { catalog: 'RegimenFiscal', code: '612', description: 'Personas Físicas con Actividades Empresariales y Profesionales' },
  { catalog: 'RegimenFiscal', code: '626', description: 'Régimen Simplificado de Confianza' },
]
