/**
 * @en Homologación mock for AFIP Padrón A4 (#192).
 * @es Mock de homologación del Padrón A4 AFIP (#192).
 * @pt-BR Mock de homologação do Padrón A4 AFIP (#192).
 */

export type PadronCondIva = 'RI' | 'Mono' | 'CF' | 'Exento'

export type PadronA4Persona = {
  cuit: string
  razonSocial: string
  domicilio: string | null
  localidad: string | null
  cpost: string | null
  condIva: PadronCondIva
  /** activo | inactivo */
  estado: 'activo' | 'inactivo'
  categoriaMonotributo: string | null
}

export type PadronA4MockResult =
  | { status: 'ok'; persona: PadronA4Persona }
  | { status: 'not_found' }
  | { status: 'timeout' }

/** Known homologación CUIT with full persona data (check-digit valid). */
export const PADRON_MOCK_KNOWN_CUIT = '20111111112'

/** Valid CUIT that mock treats as not found in AFIP padrón. */
export const PADRON_MOCK_NOT_FOUND_CUIT = '20222222223'

/** Valid CUIT that mock simulates timeout (for tests). */
export const PADRON_MOCK_TIMEOUT_CUIT = '20333333334'

const KNOWN: Record<string, PadronA4Persona> = {
  [PADRON_MOCK_KNOWN_CUIT]: {
    cuit: PADRON_MOCK_KNOWN_CUIT,
    razonSocial: 'DEMO SA PADRON A4 MOCK LARGO NOMBRE',
    domicilio: 'Av Corrientes 1234',
    localidad: 'CABA',
    cpost: '1043',
    condIva: 'RI',
    estado: 'activo',
    categoriaMonotributo: null,
  },
  '23333333333': {
    cuit: '23333333333',
    razonSocial: 'MONOTRIBUTISTA DEMO',
    domicilio: 'Calle Falsa 123',
    localidad: 'Rosario',
    cpost: '2000',
    condIva: 'Mono',
    estado: 'activo',
    categoriaMonotributo: 'C',
  },
}

/**
 * @en Normalizes CUIT/CUIL to 11 digits.
 * @es Normaliza CUIT/CUIL a 11 dígitos.
 * @pt-BR Normaliza CUIT/CUIL para 11 dígitos.
 */
export function normalizeCuitDigits(cuit: string): string {
  return cuit.replace(/\D/g, '')
}

/**
 * @en Maps AFIP/ARCA tax condition codes to BizCode condIva.
 * @es Mapea códigos de condición IVA AFIP/ARCA a condIva de BizCode.
 * @pt-BR Mapeia códigos de condição IVA AFIP/ARCA para condIva do BizCode.
 */
export function mapAfipImpuestoToCondIva(code: string | number | null | undefined): PadronCondIva {
  const raw = String(code ?? '').trim().toUpperCase()
  if (raw === 'MONO' || raw === 'MONOTRIBUTO' || raw === '6' || raw === '13') return 'Mono'
  if (raw === 'CF' || raw === 'CONSUMIDOR FINAL' || raw === '5') return 'CF'
  if (raw === 'EXENTO' || raw === 'EX' || raw === '4') return 'Exento'
  return 'RI'
}

export type MockConsultaPadronOptions = {
  /** Force timeout result regardless of CUIT (tests). */
  forceTimeout?: boolean
}

/**
 * @en Homologación mock for ws_sr_padron_a4; production live SOAP is out of scope (#192).
 * @es Mock de homologación para ws_sr_padron_a4; SOAP live de producción fuera de alcance (#192).
 * @pt-BR Mock de homologação para ws_sr_padron_a4; SOAP live de produção fora de escopo (#192).
 */
export function mockConsultaPadronA4(
  cuitRaw: string,
  options: MockConsultaPadronOptions = {},
): PadronA4MockResult {
  if (options.forceTimeout) return { status: 'timeout' }
  const cuit = normalizeCuitDigits(cuitRaw)
  if (cuit === PADRON_MOCK_TIMEOUT_CUIT) return { status: 'timeout' }
  if (cuit === PADRON_MOCK_NOT_FOUND_CUIT) return { status: 'not_found' }
  const persona = KNOWN[cuit]
  if (!persona) return { status: 'not_found' }
  return { status: 'ok', persona: { ...persona } }
}
