/**
 * @en Fetches BCRA official USD reference rate (variable 4) for #243.
 * @es Obtiene el TC oficial USD de referencia BCRA (variable 4) para #243.
 * @pt-BR Obtém o câmbio oficial USD de referência BCRA (variável 4) para #243.
 */

export type BcraRateResult = {
  valor: number
  fecha: Date
  rawFecha: string
}

function formatDateYmd(d: Date): string {
  const y = d.getUTCFullYear()
  const m = String(d.getUTCMonth() + 1).padStart(2, '0')
  const day = String(d.getUTCDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

/**
 * @en Calls BCRA estadísticas v2 for USD reference (variable id 4).
 * @es Llama a estadísticas BCRA v2 para USD de referencia (id 4).
 * @pt-BR Chama estatísticas BCRA v2 para USD de referência (id 4).
 */
export async function fetchBcraUsdOficial(now = new Date()): Promise<BcraRateResult> {
  const to = formatDateYmd(now)
  const fromDate = new Date(now)
  fromDate.setUTCDate(fromDate.getUTCDate() - 14)
  const from = formatDateYmd(fromDate)
  const url = `https://api.bcra.gob.ar/estadisticas/v2.0/datosvariable/4/${from}/${to}`
  const res = await fetch(url, {
    headers: { Accept: 'application/json' },
    signal: AbortSignal.timeout(15000),
  })
  if (!res.ok) {
    throw new Error(`BCRA API HTTP ${res.status}`)
  }
  const body = (await res.json()) as {
    results?: Array<{ fecha?: string; valor?: number | string }>
    status?: number
  }
  const rows = Array.isArray(body.results) ? body.results : []
  if (rows.length === 0) {
    throw new Error('BCRA API returned no rates')
  }
  const last = rows[rows.length - 1]!
  const valor = typeof last.valor === 'number' ? last.valor : Number.parseFloat(String(last.valor))
  if (!Number.isFinite(valor) || valor <= 0) {
    throw new Error('BCRA API returned invalid rate')
  }
  const rawFecha = typeof last.fecha === 'string' ? last.fecha : to
  const fecha = new Date(`${rawFecha.slice(0, 10)}T12:00:00.000Z`)
  return { valor, fecha: Number.isNaN(fecha.getTime()) ? now : fecha, rawFecha }
}
