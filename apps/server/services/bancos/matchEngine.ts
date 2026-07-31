/**
 * @en Pure, side-effect-free bank reconciliation matching engine (#191). Scores and ranks
 * candidate collections (ReciboCobroForma / legacy Cobro) against a bank movement so the
 * caller can decide whether to auto-match, suggest, or leave a movement unmatched.
 * @es Motor de conciliación bancaria puro y sin efectos secundarios (#191). Puntúa y ordena
 * candidatos de cobro (ReciboCobroForma / Cobro legado) contra un movimiento bancario para que
 * quien lo invoque decida si concilia automáticamente, sugiere, o deja el movimiento sin conciliar.
 * @pt-BR Motor de conciliação bancária puro e sem efeitos colaterais (#191). Pontua e ordena
 * candidatos de recebimento (ReciboCobroForma / Cobro legado) contra um movimento bancário para
 * que quem o invoque decida se concilia automaticamente, sugere, ou deixa o movimento sem conciliar.
 */
import {
  AMOUNT_TOLERANCE_PCT,
  CHEQUE_DATE_TOLERANCE_DAYS,
  DATE_TOLERANCE_DAYS,
  MP_FEE_MAX_PCT,
  MP_FEE_MIN_PCT,
  type ConciliadoTipo,
} from './matchingConstants'

/**
 * @en A candidate collection record (payment form or legacy Cobro) that a bank movement may match.
 * @es Un registro candidato de cobro (forma de pago o Cobro legado) que un movimiento puede conciliar.
 * @pt-BR Um registro candidato de recebimento (forma de pagamento ou Cobro legado) que um movimento pode conciliar.
 */
export type MatchCandidate = {
  tipo: ConciliadoTipo
  id: number
  clienteId: number
  fecha: Date
  importe: number
  referencia?: string | null
  banco?: string | null
  chequeVencimiento?: Date | null
  isMercadoPago: boolean
  clienteCbu?: string | null
  clienteAlias?: string | null
}

/**
 * @en Minimal shape of a bank movement required to run the matching engine.
 * @es Forma mínima de un movimiento bancario requerida para ejecutar el motor de matching.
 * @pt-BR Forma mínima de um movimento bancário necessária para executar o motor de matching.
 */
export type MovementLike = {
  id: number
  fecha: Date
  descripcion: string
  importe: number
  tipo: 'debito' | 'credito'
  referencia?: string | null
}

export type FindMatchesStatus = 'auto' | 'suggested' | 'none' | 'bank_fee'

export type FindMatchesResult = {
  status: FindMatchesStatus
  winners: MatchCandidate[]
  score: number
}

const BANK_FEE_KEYWORDS = [
  'MANTENIMIENTO',
  'MANTENIMIENTO DE CUENTA',
  'IMPUESTO',
  'IMPUESTO LEY',
  'COMISION',
  'COMISIÓN',
  'IVA',
  'SELLADO',
  'SELLOS',
  'DEBITO BANCARIO',
  'DÉBITO BANCARIO',
  'GASTO BANCARIO',
  'GASTOS BANCARIOS',
  'PERCEPCION',
  'PERCEPCIÓN',
]

/**
 * @en Detects debit movements that are very likely automatic bank charges (fees, taxes) rather
 * than a client collection, based on common Argentine bank statement wording.
 * @es Detecta movimientos débito muy probablemente correspondientes a cargos bancarios automáticos
 * (comisiones, impuestos) y no a un cobro de cliente, según texto habitual de extractos argentinos.
 * @pt-BR Detecta movimentos de débito muito provavelmente correspondentes a encargos bancários
 * automáticos (taxas, impostos) e não a um recebimento de cliente, com base em texto comum de extratos.
 */
export function isLikelyBankFee(descripcion: string, tipo: string): boolean {
  if (tipo !== 'debito') return false
  const upper = descripcion.toUpperCase()
  return BANK_FEE_KEYWORDS.some((keyword) => upper.includes(keyword))
}

/**
 * @en Detects whether a movement description references Mercado Pago settlements.
 * @es Detecta si la descripción de un movimiento hace referencia a liquidaciones de Mercado Pago.
 * @pt-BR Detecta se a descrição de um movimento faz referência a liquidações do Mercado Pago.
 */
export function isMercadoPagoMovement(descripcion: string): boolean {
  return /MERCADOPAGO/i.test(descripcion)
}

/**
 * @en Checks whether two amounts are within `pct` percent of each other (floor of 0.01 for rounding).
 * @es Verifica si dos importes difieren en menos de `pct` por ciento (piso de 0.01 por redondeo).
 * @pt-BR Verifica se dois valores diferem em menos de `pct` por cento (piso de 0.01 por arredondamento).
 */
export function amountWithinTolerance(a: number, b: number, pct: number): boolean {
  const diff = Math.abs(a - b)
  const base = Math.max(Math.abs(a), Math.abs(b), 0.01)
  const tolerance = Math.max(base * (pct / 100), 0.01)
  return diff <= tolerance
}

/**
 * @en Checks whether a bank net credit is consistent with a gross Mercado Pago collection after a
 * platform fee between MP_FEE_MIN_PCT and MP_FEE_MAX_PCT was deducted.
 * @es Verifica si un crédito neto bancario es consistente con un cobro bruto de Mercado Pago tras
 * descontar una comisión de plataforma entre MP_FEE_MIN_PCT y MP_FEE_MAX_PCT.
 * @pt-BR Verifica se um crédito líquido bancário é consistente com um recebimento bruto do Mercado
 * Pago após deduzir uma taxa de plataforma entre MP_FEE_MIN_PCT e MP_FEE_MAX_PCT.
 */
export function amountWithinMpNetBand(grossCobro: number, bankNet: number): boolean {
  if (grossCobro <= 0) return false
  const minNet = grossCobro * (1 - MP_FEE_MAX_PCT / 100)
  const maxNet = grossCobro * (1 - MP_FEE_MIN_PCT / 100)
  const epsilon = Math.max(grossCobro * 0.001, 0.01)
  return bankNet >= minNet - epsilon && bankNet <= maxNet + epsilon
}

/**
 * @en Absolute number of calendar days between two dates (time-of-day ignored).
 * @es Cantidad absoluta de días de calendario entre dos fechas (se ignora la hora).
 * @pt-BR Quantidade absoluta de dias de calendário entre duas datas (hora ignorada).
 */
export function daysBetween(a: Date, b: Date): number {
  const utcA = Date.UTC(a.getUTCFullYear(), a.getUTCMonth(), a.getUTCDate())
  const utcB = Date.UTC(b.getUTCFullYear(), b.getUTCMonth(), b.getUTCDate())
  return Math.round(Math.abs(utcA - utcB) / 86_400_000)
}

const AMOUNT_EXACT_MATCH_BONUS = 10
const AMOUNT_MATCH_SCORE = 50
const MP_BAND_MATCH_SCORE = 40
const MP_DESCRIPTION_BONUS = 15
const DATE_MATCH_MAX_SCORE = 20
const CBU_MATCH_BONUS = 25
const ALIAS_MATCH_BONUS = 20
const REFERENCIA_MATCH_BONUS = 15
const RECIBO_FORMA_PRIORITY_BONUS = 1

/**
 * @en Scores how well a candidate matches a bank movement. Returns 0 when a hard filter (amount
 * outside tolerance/MP band, or date outside window) fails; otherwise returns a positive score
 * where higher is a better match. Factors: amount match, date proximity, client CBU/alias found in
 * the movement description or referencia, referencia overlap, cheque due-date window, MP net band.
 * @es Puntúa qué tan bien un candidato coincide con un movimiento bancario. Devuelve 0 si un filtro
 * duro falla (importe fuera de tolerancia/banda MP, o fecha fuera de ventana); en caso contrario
 * devuelve un puntaje positivo donde mayor es mejor. Factores: coincidencia de importe, cercanía de
 * fecha, CBU/alias del cliente hallado en descripción o referencia, superposición de referencia,
 * ventana de vencimiento de cheque, banda neta de MP.
 * @pt-BR Pontua o quão bem um candidato corresponde a um movimento bancário. Retorna 0 se um filtro
 * rígido falhar (valor fora da tolerância/banda MP, ou data fora da janela); caso contrário retorna
 * uma pontuação positiva onde maior é melhor. Fatores: correspondência de valor, proximidade de data,
 * CBU/alias do cliente encontrado na descrição ou referência, sobreposição de referência, janela de
 * vencimento de cheque, banda líquida de MP.
 */
export function scoreCandidate(mov: MovementLike, candidate: MatchCandidate): number {
  let score = 0

  if (candidate.isMercadoPago) {
    if (!amountWithinMpNetBand(candidate.importe, mov.importe)) return 0
    score += MP_BAND_MATCH_SCORE
    if (isMercadoPagoMovement(mov.descripcion)) score += MP_DESCRIPTION_BONUS
  } else {
    if (!amountWithinTolerance(candidate.importe, mov.importe, AMOUNT_TOLERANCE_PCT)) return 0
    score += AMOUNT_MATCH_SCORE
    if (Math.abs(candidate.importe - mov.importe) < 0.01) score += AMOUNT_EXACT_MATCH_BONUS
  }

  const dateTolerance = candidate.chequeVencimiento ? CHEQUE_DATE_TOLERANCE_DAYS : DATE_TOLERANCE_DAYS
  const referenceDate = candidate.chequeVencimiento ?? candidate.fecha
  const days = daysBetween(mov.fecha, referenceDate)
  if (days > dateTolerance) return 0
  score += Math.max(0, DATE_MATCH_MAX_SCORE - days * (DATE_MATCH_MAX_SCORE / (dateTolerance + 1)))

  const haystack = `${mov.descripcion} ${mov.referencia ?? ''}`.toLowerCase()

  if (candidate.clienteCbu && candidate.clienteCbu.trim().length >= 6) {
    if (haystack.includes(candidate.clienteCbu.trim().toLowerCase())) score += CBU_MATCH_BONUS
  }
  if (candidate.clienteAlias && candidate.clienteAlias.trim().length >= 3) {
    if (haystack.includes(candidate.clienteAlias.trim().toLowerCase())) score += ALIAS_MATCH_BONUS
  }

  if (candidate.referencia && mov.referencia) {
    const candidateRef = candidate.referencia.trim().toLowerCase()
    const movRef = mov.referencia.trim().toLowerCase()
    if (candidateRef.length >= 3 && (candidateRef === movRef || haystack.includes(candidateRef))) {
      score += REFERENCIA_MATCH_BONUS
    }
  }

  if (candidate.tipo === 'recibo_forma') score += RECIBO_FORMA_PRIORITY_BONUS

  return score
}

const AUTO_MIN_SCORE = 60
const AUTO_MARGIN = 15
const SUGGESTED_MIN_SCORE = 30

/**
 * @en Runs the matching engine for a single bank movement against a candidate pool, honoring
 * `usedIds` (keys `${tipo}:${id}`) so each candidate is only ever consumed once. Debit movements
 * that look like bank fees short-circuit to `bank_fee`. A single candidate with a score above
 * AUTO_MIN_SCORE and a clear margin over the runner-up auto-matches; multiple close candidates are
 * returned as `suggested`; otherwise the result is `none`.
 * @es Ejecuta el motor de matching para un movimiento bancario contra un pool de candidatos,
 * respetando `usedIds` (claves `${tipo}:${id}`) para que cada candidato se consuma una sola vez. Los
 * movimientos débito que parecen cargos bancarios retornan `bank_fee` directamente. Un candidato
 * único con puntaje sobre AUTO_MIN_SCORE y margen claro sobre el segundo concilia automáticamente;
 * varios candidatos cercanos se devuelven como `suggested`; en caso contrario el resultado es `none`.
 * @pt-BR Executa o motor de matching para um movimento bancário contra um pool de candidatos,
 * respeitando `usedIds` (chaves `${tipo}:${id}`) para que cada candidato seja consumido apenas uma
 * vez. Movimentos de débito que parecem encargos bancários retornam `bank_fee` diretamente. Um único
 * candidato com pontuação acima de AUTO_MIN_SCORE e margem clara sobre o segundo concilia
 * automaticamente; vários candidatos próximos são retornados como `suggested`; caso contrário o
 * resultado é `none`.
 */
export function findMatches(
  mov: MovementLike,
  candidates: MatchCandidate[],
  usedIds: Set<string>,
): FindMatchesResult {
  if (mov.tipo === 'debito') {
    if (isLikelyBankFee(mov.descripcion, mov.tipo)) {
      return { status: 'bank_fee', winners: [], score: 0 }
    }
    return { status: 'none', winners: [], score: 0 }
  }

  const available = candidates.filter((c) => !usedIds.has(`${c.tipo}:${c.id}`))
  const scored = available
    .map((candidate) => ({ candidate, score: scoreCandidate(mov, candidate) }))
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score)

  if (scored.length === 0) {
    return { status: 'none', winners: [], score: 0 }
  }

  const best = scored[0]!
  const second = scored[1]

  if (best.score >= AUTO_MIN_SCORE && (!second || best.score - second.score >= AUTO_MARGIN)) {
    return { status: 'auto', winners: [best.candidate], score: best.score }
  }

  const closeThreshold = Math.max(best.score - AUTO_MARGIN, SUGGESTED_MIN_SCORE)
  const winners = scored.filter((entry) => entry.score >= closeThreshold).map((entry) => entry.candidate)

  return { status: 'suggested', winners: winners.length > 0 ? winners : [best.candidate], score: best.score }
}
