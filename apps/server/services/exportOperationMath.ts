import type {
  DespachanteFields,
  DespachanteInput,
  ExportOperationFields,
  ExportOperationInput,
  Incoterm,
  OperationCurrency,
} from '@bizcode/types'
import { INCOTERMS_2020, LOCAL_CURRENCY, OPERATION_CURRENCIES } from '@bizcode/types'
import type { ServiceResult } from './serviceResults'

/**
 * @en Field limits mirror the Prisma column widths for the export vertical (#206).
 * @es Los límites reflejan el ancho de columna Prisma del vertical exportación (#206).
 * @pt-BR Os limites refletem a largura das colunas Prisma do vertical exportação (#206).
 */
export const DESPACHANTE_NOMBRE_MAX = 120
export const DESPACHANTE_EMAIL_MAX = 160

const COUNTRY_CODE_RE = /^[A-Z]{2}$/
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const MAX_DECIMAL_14_2 = 999_999_999_999.99

/**
 * @en Numeric balance per currency; callers serialize it to the 2-decimal string the API exposes.
 * @es Saldo numérico por moneda; el llamador lo serializa al string de 2 decimales que expone la API.
 * @pt-BR Saldo numérico por moeda; o chamador o serializa para a string de 2 decimais exposta pela API.
 */
export type SaldoMonedaAmount = {
  moneda: string
  saldo: number
}

function fail(error: string, status = 400): ServiceResult<never> {
  return { ok: false, status, error }
}

/**
 * @en Type guard for the Incoterms 2020 rule set.
 * @es Type guard para el conjunto de reglas Incoterms 2020.
 * @pt-BR Type guard para o conjunto de regras Incoterms 2020.
 */
export function isIncoterm(value: string): value is Incoterm {
  return (INCOTERMS_2020 as readonly string[]).includes(value)
}

/**
 * @en Type guard for the currencies an operation can be denominated in.
 * @es Type guard para las monedas en que puede denominarse una operación.
 * @pt-BR Type guard para as moedas em que uma operação pode ser denominada.
 */
export function isOperationCurrency(value: string): value is OperationCurrency {
  return (OPERATION_CURRENCIES as readonly string[]).includes(value)
}

/**
 * @en Normalizes an ISO-3166-1 alpha-2 country code; returns null when empty, 'invalid' when malformed.
 * @es Normaliza un código de país ISO-3166-1 alpha-2; null si viene vacío, 'invalid' si está mal formado.
 * @pt-BR Normaliza um código de país ISO-3166-1 alpha-2; null se vazio, 'invalid' se malformado.
 */
export function normalizeCountryCode(value: string | null | undefined): string | null | 'invalid' {
  if (value === null || value === undefined) return null
  const trimmed = value.trim().toUpperCase()
  if (!trimmed) return null
  if (!COUNTRY_CODE_RE.test(trimmed)) return 'invalid'
  return trimmed
}

function isFiniteAmount(value: number): boolean {
  return Number.isFinite(value) && value > 0 && value <= MAX_DECIMAL_14_2
}

/**
 * @en Converts a foreign-currency amount into local currency using the operation exchange rate.
 * @es Convierte un importe en moneda extranjera a moneda local usando el TC de la operación.
 * @pt-BR Converte um valor em moeda estrangeira para a moeda local usando a taxa da operação.
 */
export function convertToLocal(amount: number, tipoCambioValor: number): number {
  return Math.round(amount * tipoCambioValor * 100) / 100
}

/**
 * @en Validates and normalizes the export fields of an invoice (#206).
 *     A non-local currency requires both an operation total and an exchange rate.
 * @es Valida y normaliza los campos de exportación de una factura (#206).
 *     Una moneda distinta de la local exige total de la operación y tipo de cambio.
 * @pt-BR Valida e normaliza os campos de exportação de uma fatura (#206).
 *     Uma moeda diferente da local exige total da operação e taxa de câmbio.
 */
export function normalizeExportFields(
  input: ExportOperationInput,
): ServiceResult<ExportOperationFields> {
  const incotermRaw = input.incoterm?.trim().toUpperCase() ?? ''
  let incoterm: Incoterm | null = null
  if (incotermRaw) {
    if (!isIncoterm(incotermRaw)) {
      return fail(`incoterm must be one of ${INCOTERMS_2020.join(', ')}`, 422)
    }
    incoterm = incotermRaw
  }

  const paisDestino = normalizeCountryCode(input.paisDestino)
  if (paisDestino === 'invalid') {
    return fail('paisDestino must be an ISO-3166-1 alpha-2 code', 422)
  }

  const monedaRaw = input.monedaOperacion?.trim().toUpperCase() ?? ''
  if (!monedaRaw) {
    if (input.totalMonedaOperacion != null) {
      return fail('monedaOperacion is required when totalMonedaOperacion is provided', 422)
    }
    return {
      ok: true,
      data: {
        monedaOperacion: null,
        totalMonedaOperacion: null,
        tipoCambioValor: null,
        incoterm,
        paisDestino,
      },
    }
  }

  if (!isOperationCurrency(monedaRaw)) {
    return fail(`monedaOperacion must be one of ${OPERATION_CURRENCIES.join(', ')}`, 422)
  }

  const total = input.totalMonedaOperacion
  if (total == null || !isFiniteAmount(total)) {
    return fail('totalMonedaOperacion must be a positive amount', 422)
  }

  if (monedaRaw === LOCAL_CURRENCY) {
    return {
      ok: true,
      data: {
        monedaOperacion: monedaRaw,
        totalMonedaOperacion: total,
        tipoCambioValor: null,
        incoterm,
        paisDestino,
      },
    }
  }

  const tipoCambioValor = input.tipoCambioValor
  if (tipoCambioValor == null || !isFiniteAmount(tipoCambioValor)) {
    return fail(
      `tipoCambioValor is required and must be positive when monedaOperacion is ${monedaRaw}`,
      422,
    )
  }

  return {
    ok: true,
    data: {
      monedaOperacion: monedaRaw,
      totalMonedaOperacion: total,
      tipoCambioValor,
      incoterm,
      paisDestino,
    },
  }
}

/**
 * @en Validates and normalizes the customs broker contact stored on the order (#206).
 * @es Valida y normaliza el contacto del despachante guardado en el pedido (#206).
 * @pt-BR Valida e normaliza o contato do despachante armazenado no pedido (#206).
 */
export function normalizeDespachanteInput(
  input: DespachanteInput,
): ServiceResult<DespachanteFields> {
  const nombre = input.despachanteNombre?.trim() ?? ''
  const email = input.despachanteEmail?.trim().toLowerCase() ?? ''

  if (nombre.length > DESPACHANTE_NOMBRE_MAX) {
    return fail(`despachanteNombre must be at most ${DESPACHANTE_NOMBRE_MAX} characters`, 422)
  }
  if (email.length > DESPACHANTE_EMAIL_MAX) {
    return fail(`despachanteEmail must be at most ${DESPACHANTE_EMAIL_MAX} characters`, 422)
  }
  if (email && !EMAIL_RE.test(email)) {
    return fail('despachanteEmail must be a valid email address', 422)
  }
  if (nombre && !email) {
    return fail('despachanteEmail is required when despachanteNombre is provided', 422)
  }

  return {
    ok: true,
    data: {
      despachanteNombre: nombre || null,
      despachanteEmail: email || null,
    },
  }
}

/**
 * @en Groups account-statement entries by currency so foreign balances never mix with the local one.
 * @es Agrupa los asientos de cuenta corriente por moneda para no mezclar saldos extranjeros con el local.
 * @pt-BR Agrupa os lançamentos da conta corrente por moeda para não misturar saldos estrangeiros com o local.
 */
export function groupSaldosByMoneda(
  movimientos: ReadonlyArray<{ moneda: string; monto: number }>,
): SaldoMonedaAmount[] {
  const totals = new Map<string, number>()
  for (const movimiento of movimientos) {
    const moneda = movimiento.moneda?.trim().toUpperCase() || LOCAL_CURRENCY
    const previous = totals.get(moneda) ?? 0
    totals.set(moneda, Math.round((previous + movimiento.monto) * 100) / 100)
  }
  return [...totals.entries()]
    .map(([moneda, saldo]) => ({ moneda, saldo }))
    .sort((a, b) => (a.moneda === LOCAL_CURRENCY ? -1 : b.moneda === LOCAL_CURRENCY ? 1 : a.moneda.localeCompare(b.moneda)))
}

/**
 * @en Builds the plain-text body sent to the customs broker; no attachments or customs filing (#206).
 * @es Arma el cuerpo de texto enviado al despachante; sin adjuntos ni despacho aduanero (#206).
 * @pt-BR Monta o corpo de texto enviado ao despachante; sem anexos nem despacho aduaneiro (#206).
 */
export function buildDespachanteEmailBody(input: {
  pedidoId: number
  clienteRsocial: string
  incoterm: string | null
  paisDestino: string | null
  moneda: string | null
  total: number
  items: ReadonlyArray<{ descripcion: string; cantidad: number }>
}): string {
  const lines = [
    `Pedido: #${input.pedidoId}`,
    `Cliente: ${input.clienteRsocial}`,
    `Incoterm: ${input.incoterm ?? '-'}`,
    `Pais destino: ${input.paisDestino ?? '-'}`,
    `Moneda: ${input.moneda ?? LOCAL_CURRENCY}`,
    `Total: ${input.total.toFixed(2)}`,
    '',
    'Mercaderia:',
    ...input.items.map((item) => `- ${item.descripcion} x ${item.cantidad}`),
  ]
  return lines.join('\n')
}
