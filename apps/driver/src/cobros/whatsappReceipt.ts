import { digitsOnly } from '../ruta/stopView'

export function buildCobroReceiptText(input: {
  template: string
  empresa: string
  cliente: string
  fecha: string
  importe: string
  forma: string
  numero: string | number
}): string {
  return input.template
    .replaceAll('{{empresa}}', input.empresa)
    .replaceAll('{{cliente}}', input.cliente)
    .replaceAll('{{fecha}}', input.fecha)
    .replaceAll('{{importe}}', input.importe)
    .replaceAll('{{forma}}', input.forma)
    .replaceAll('{{numero}}', String(input.numero))
}

export function buildCobroWaMeUrl(telef: string | null | undefined, text: string): string | null {
  const phone = digitsOnly(telef)
  if (!phone) return null
  return `https://wa.me/${phone}?text=${encodeURIComponent(text)}`
}
