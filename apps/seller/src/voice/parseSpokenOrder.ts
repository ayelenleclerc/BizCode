import { isUnidadBase, type UnidadBase } from '@bizcode/types'

export type SpokenLocale = 'es' | 'en' | 'pt-BR'

export type SpokenLine = {
  phrase: string
  qty: number
  unitHint: UnidadBase | null
}

/**
 * @en Maps spoken unit tokens to Articulo.unidadBase (#266). There is no unidadMedida field.
 * @es Mapea unidades habladas a Articulo.unidadBase (#266). No existe el campo unidadMedida.
 * @pt-BR Mapeia unidades faladas para Articulo.unidadBase (#266). Não existe o campo unidadMedida.
 */
export function normalizeUnit(token: string): UnidadBase | null {
  const t = fold(token)
  if (!t) return null
  if (t === 'caja' || t === 'cajas' || t === 'cajon' || t === 'cajones' || t === 'box' || t === 'boxes' || t === 'caixa' || t === 'caixas') {
    return 'caja'
  }
  if (t === 'kg' || t === 'kilo' || t === 'kilos' || t === 'kilogramo' || t === 'kilogramos' || t === 'kilogram' || t === 'kilograms' || t === 'quilo' || t === 'quilos') {
    return 'kg'
  }
  if (t === 'g' || t === 'gr' || t === 'gramo' || t === 'gramos' || t === 'gram' || t === 'grams' || t === 'grama' || t === 'gramas') {
    return 'gramo'
  }
  if (t === 'l' || t === 'lt' || t === 'litro' || t === 'litros' || t === 'liter' || t === 'liters' || t === 'litre' || t === 'litres') {
    return 'litro'
  }
  if (t === 'm2' || t === 'm²' || t.includes('cuadrad') || t.includes('quadrad') || t.includes('square')) {
    return 'm2'
  }
  if (t === 'm3' || t === 'm³' || t.includes('cubic') || t.includes('cubo')) {
    return 'm3'
  }
  if (t === 'm' || t === 'mt' || t === 'metro' || t === 'metros' || t === 'meter' || t === 'meters' || t === 'metre' || t === 'metres') {
    return 'metro'
  }
  if (t === 'rollo' || t === 'rollos' || t === 'roll' || t === 'rolls') {
    return 'rollo'
  }
  if (
    t === 'unidad' ||
    t === 'unidades' ||
    t === 'u' ||
    t === 'un' ||
    t === 'unit' ||
    t === 'units' ||
    t === 'unidade' ||
    t === 'unidades'
  ) {
    return 'unidad'
  }
  return isUnidadBase(t) ? t : null
}

/**
 * @en Parses a spoken order into lines (qty, unit hint, remaining phrase). Empty if nothing parsed.
 * @es Parsea un pedido hablado en líneas (qty, unidad, frase). Vacío si no hay ítems.
 * @pt-BR Faz parse de um pedido falado em linhas (qty, unidade, frase). Vazio se não houver itens.
 */
export function parseSpokenOrder(text: string, locale: SpokenLocale): SpokenLine[] {
  const prepared = protectHalfPhrases(fold(text), locale)
  if (!prepared.trim()) return []
  const clauses = splitClauses(prepared, locale)
  const lines: SpokenLine[] = []
  for (const clause of clauses) {
    const parsed = parseClause(clause, locale)
    if (parsed) lines.push(parsed)
  }
  return lines
}

function fold(s: string): string {
  return s
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .toLowerCase()
    .replace(/['’]/g, '')
    .trim()
}

function protectHalfPhrases(text: string, locale: SpokenLocale): string {
  if (locale === 'en') {
    return text
      .replace(/\b(\d+(?:\.\d+)?)\s+and\s+a\s+half\b/g, '$1.5')
      .replace(/\bone\s+and\s+a\s+half\b/g, '1.5')
      .replace(/\ba\s+half\b/g, '0.5')
  }
  if (locale === 'pt-BR') {
    return text
      .replace(/\bum\s+quilo\s+e\s+meio\b/g, '1.5 kg')
      .replace(/\b(\d+(?:[.,]\d+)?)\s+e\s+meio\b/g, '$1.5')
      .replace(/\bmeio\b/g, '0.5')
  }
  return text
    .replace(/\bun\s+kilo\s+y\s+medio\b/g, '1.5 kg')
    .replace(/\buna?\s+kilo\s+y\s+medio\b/g, '1.5 kg')
    .replace(/\b(\d+(?:[.,]\d+)?)\s+y\s+medio\b/g, '$1.5')
    .replace(/\bmedia\s+docena\b/g, '6')
    .replace(/\bmedio\b/g, '0.5')
}

function splitClauses(text: string, locale: SpokenLocale): string[] {
  const joiner =
    locale === 'en' ? /\s+and\s+|,\s*|;\s*/ : locale === 'pt-BR' ? /\s+e\s+|,\s*|;\s*/ : /\s+y\s+|,\s*|;\s*/
  return text
    .split(joiner)
    .map((c) => c.trim())
    .filter((c) => c.length > 0)
}

const NUMBER_WORDS: Record<SpokenLocale, Array<[string, number]>> = {
  es: [
    ['media docena', 6],
    ['una docena', 12],
    ['un docena', 12],
    ['docena', 12],
    ['cero', 0],
    ['una', 1],
    ['uno', 1],
    ['un', 1],
    ['dos', 2],
    ['tres', 3],
    ['cuatro', 4],
    ['cinco', 5],
    ['seis', 6],
    ['siete', 7],
    ['ocho', 8],
    ['nueve', 9],
    ['diez', 10],
    ['once', 11],
    ['doce', 12],
    ['trece', 13],
    ['catorce', 14],
    ['quince', 15],
    ['veinte', 20],
    ['treinta', 30],
    ['cuarenta', 40],
    ['cincuenta', 50],
    ['cien', 100],
  ],
  en: [
    ['a dozen', 12],
    ['dozen', 12],
    ['zero', 0],
    ['one', 1],
    ['a', 1],
    ['two', 2],
    ['three', 3],
    ['four', 4],
    ['five', 5],
    ['six', 6],
    ['seven', 7],
    ['eight', 8],
    ['nine', 9],
    ['ten', 10],
    ['eleven', 11],
    ['twelve', 12],
    ['thirteen', 13],
    ['fourteen', 14],
    ['fifteen', 15],
    ['twenty', 20],
    ['thirty', 30],
    ['forty', 40],
    ['fifty', 50],
    ['hundred', 100],
  ],
  'pt-BR': [
    ['meia duzia', 6],
    ['uma duzia', 12],
    ['duzia', 12],
    ['zero', 0],
    ['uma', 1],
    ['um', 1],
    ['dois', 2],
    ['duas', 2],
    ['tres', 3],
    ['quatro', 4],
    ['cinco', 5],
    ['seis', 6],
    ['sete', 7],
    ['oito', 8],
    ['nove', 9],
    ['dez', 10],
    ['onze', 11],
    ['doze', 12],
    ['treze', 13],
    ['quatorze', 14],
    ['catorze', 14],
    ['quinze', 15],
    ['vinte', 20],
    ['trinta', 30],
    ['quarenta', 40],
    ['cinquenta', 50],
    ['cem', 100],
  ],
}

function parseClause(clause: string, locale: SpokenLocale): SpokenLine | null {
  let rest = clause.replace(/\bde\b|\bof\b|\bda\b|\bdo\b/g, ' ').replace(/\s+/g, ' ').trim()
  const qtyHit = takeQty(rest, locale)
  if (!qtyHit) return null
  rest = qtyHit.rest
  const unitHit = takeUnit(rest)
  rest = unitHit.rest
  const phrase = rest.replace(/^(de|of|da|do)\s+/, '').trim()
  if (!phrase) return null
  if (!Number.isFinite(qtyHit.qty) || qtyHit.qty <= 0) return null
  return { phrase, qty: qtyHit.qty, unitHint: unitHit.unit }
}

function takeQty(rest: string, locale: SpokenLocale): { qty: number; rest: string } | null {
  const digit = rest.match(/^(\d+(?:[.,]\d+)?)\b/)
  if (digit) {
    const qty = Number.parseFloat(digit[1].replace(',', '.'))
    return { qty, rest: rest.slice(digit[0].length).trim() }
  }
  const words = [...NUMBER_WORDS[locale]].sort((a, b) => b[0].length - a[0].length)
  for (const [word, qty] of words) {
    if (rest === word || rest.startsWith(`${word} `)) {
      return { qty, rest: rest.slice(word.length).trim() }
    }
  }
  return null
}

function takeUnit(rest: string): { unit: UnidadBase | null; rest: string } {
  const first = rest.split(/\s+/)[0] ?? ''
  const unit = normalizeUnit(first)
  if (unit) {
    return { unit, rest: rest.slice(first.length).trim() }
  }
  return { unit: null, rest }
}
