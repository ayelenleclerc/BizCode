const UNIDADES = [
  '',
  'uno',
  'dos',
  'tres',
  'cuatro',
  'cinco',
  'seis',
  'siete',
  'ocho',
  'nueve',
  'diez',
  'once',
  'doce',
  'trece',
  'catorce',
  'quince',
  'dieciséis',
  'diecisiete',
  'dieciocho',
  'diecinueve',
  'veinte',
  'veintiuno',
  'veintidós',
  'veintitrés',
  'veinticuatro',
  'veinticinco',
  'veintiséis',
  'veintisiete',
  'veintiocho',
  'veintinueve',
]

const DECENAS = ['', '', 'veinte', 'treinta', 'cuarenta', 'cincuenta', 'sesenta', 'setenta', 'ochenta', 'noventa']
const CENTENAS = [
  '',
  'ciento',
  'doscientos',
  'trescientos',
  'cuatrocientos',
  'quinientos',
  'seiscientos',
  'setecientos',
  'ochocientos',
  'novecientos',
]

function chunkToWords(n: number): string {
  if (n === 0) return ''
  if (n === 100) return 'cien'
  if (n < 30) return UNIDADES[n] ?? ''
  if (n < 100) {
    const d = Math.floor(n / 10)
    const u = n % 10
    if (d === 2 && u > 0) return UNIDADES[n] ?? ''
    const dec = DECENAS[d] ?? ''
    return u === 0 ? dec : `${dec} y ${UNIDADES[u]}`
  }
  const c = Math.floor(n / 100)
  const rest = n % 100
  const cent = CENTENAS[c] ?? ''
  if (rest === 0) return cent
  return `${cent} ${chunkToWords(rest)}`.trim()
}

function integerToWords(n: number): string {
  if (n === 0) return 'cero'
  if (n === 1) return 'un'
  const parts: string[] = []
  const millones = Math.floor(n / 1_000_000)
  const miles = Math.floor((n % 1_000_000) / 1000)
  const resto = n % 1000

  if (millones > 0) {
    parts.push(millones === 1 ? 'un millón' : `${chunkToWords(millones)} millones`)
  }
  if (miles > 0) {
    parts.push(miles === 1 ? 'mil' : `${chunkToWords(miles)} mil`)
  }
  if (resto > 0) {
    parts.push(chunkToWords(resto))
  }
  return parts.join(' ').replace(/\s+/g, ' ').trim()
}

/**
 * @en Converts ARS amount to Spanish words for legal receipts (#233).
 * @es Convierte monto ARS a letras en español para recibos (#233).
 * @pt-BR Converte valor ARS para texto legal em espanhol (#233).
 */
export function montoEnLetrasArs(amount: number | string): string {
  const value = typeof amount === 'string' ? Number.parseFloat(amount) : amount
  if (!Number.isFinite(value)) return 'cero pesos'
  const abs = Math.abs(value)
  const entero = Math.floor(abs)
  const centavos = Math.round((abs - entero) * 100)
  const sign = value < 0 ? 'menos ' : ''
  const enteroTxt = integerToWords(entero)
  const moneda = entero === 1 ? 'peso' : 'pesos'
  if (centavos === 0) {
    return `${sign}${enteroTxt} ${moneda}`.trim()
  }
  const centTxt = integerToWords(centavos)
  const centLabel = centavos === 1 ? 'centavo' : 'centavos'
  return `${sign}${enteroTxt} ${moneda} con ${centTxt} ${centLabel}`.trim()
}
