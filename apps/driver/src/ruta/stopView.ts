export function countBultos(item: { ordenEntrega?: { items?: { cantidad: number }[] } }): number {
  const lines = item.ordenEntrega?.items ?? []
  return lines.reduce((sum, line) => sum + (Number(line.cantidad) || 0), 0)
}

export function digitsOnly(value: string | null | undefined): string {
  if (!value) return ''
  return value.replace(/\D+/g, '')
}

export function mapsUrl(input: {
  latitud?: number | null
  longitud?: number | null
  domicilio?: string | null
  localidad?: string | null
}): string | null {
  if (input.latitud != null && input.longitud != null) {
    return `https://maps.google.com/?q=${input.latitud},${input.longitud}`
  }
  const q = [input.domicilio, input.localidad].filter(Boolean).join(', ')
  if (!q) return null
  return `https://maps.google.com/?q=${encodeURIComponent(q)}`
}

export function hasDebt(balance: string | null | undefined): boolean {
  if (!balance) return false
  const n = Number(balance)
  return Number.isFinite(n) && n > 0
}
