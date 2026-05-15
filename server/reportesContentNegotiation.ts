import type { Request, Response } from 'express'

/**
 * @en True when client requests CSV via Accept header.
 * @es Verdadero si el cliente pide CSV en Accept.
 * @pt-BR Verdadeiro quando o cliente solicita CSV no Accept.
 */
export function wantsCsv(req: Request): boolean {
  const accept = req.get('Accept') ?? ''
  return accept.includes('text/csv')
}

/**
 * @en Sends CSV body with download headers.
 * @es Envía cuerpo CSV con cabeceras de descarga.
 * @pt-BR Envia corpo CSV com cabeçalhos de download.
 */
export function sendCsv(res: Response, filename: string, body: string): void {
  res.setHeader('Content-Type', 'text/csv; charset=utf-8')
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`)
  res.status(200).send(body)
}

/**
 * @en Escapes a CSV field (RFC-style quoting).
 * @es Escapa un campo CSV (comillas estilo RFC).
 * @pt-BR Escapa um campo CSV (aspas estilo RFC).
 */
export function escapeCsvField(value: string | number): string {
  const s = String(value)
  if (/[",\n\r]/.test(s)) {
    return `"${s.replace(/"/g, '""')}"`
  }
  return s
}

/**
 * @en Builds CSV text from header row and data rows.
 * @es Arma texto CSV desde fila de cabeceras y filas de datos.
 * @pt-BR Monta texto CSV a partir de cabeçalho e linhas de dados.
 */
export function rowsToCsv(headers: string[], rows: (string | number)[][]): string {
  const lines = [
    headers.map(escapeCsvField).join(','),
    ...rows.map((row) => row.map(escapeCsvField).join(',')),
  ]
  return `${lines.join('\n')}\n`
}
