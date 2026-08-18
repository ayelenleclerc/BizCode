export type FormaPagoLike = {
  id: number
  descripcion: string
  esEfectivo?: boolean | null
}

function haystack(fp: FormaPagoLike): string {
  return fp.descripcion.toLowerCase()
}

export function isChequeForma(fp: FormaPagoLike): boolean {
  return haystack(fp).includes('cheque')
}

export function isTransferForma(fp: FormaPagoLike): boolean {
  const d = haystack(fp)
  return d.includes('transfer') || d.includes('transf')
}

export function isEfectivoForma(fp: FormaPagoLike): boolean {
  if (fp.esEfectivo === true) return true
  const d = haystack(fp)
  return d.includes('efectivo') || d.includes('contado')
}

export function pickDefaultFormaPagoId(formas: FormaPagoLike[]): number | null {
  const cash = formas.find(isEfectivoForma)
  return cash?.id ?? formas[0]?.id ?? null
}

export function findFormaPago(formas: FormaPagoLike[], id: number | null): FormaPagoLike | null {
  if (id == null) return null
  return formas.find((fp) => fp.id === id) ?? null
}
