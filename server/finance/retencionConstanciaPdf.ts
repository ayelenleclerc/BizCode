import PDFDocument from 'pdfkit'
import type { RetencionConstanciaPdfData } from '../services/FiscalRetencionesService'

const TIPO_LABELS: Record<string, string> = {
  ganancias: 'Retención Ganancias',
  iva: 'Retención IVA',
  iibb: 'Retención IIBB',
}

/**
 * @en Builds withholding certificate PDF for supplier payment (#276).
 * @es Genera PDF de constancia de retención en pago a proveedor (#276).
 * @pt-BR Gera PDF de certificado de retenção em pagamento a fornecedor (#276).
 */
export function buildRetencionConstanciaPdfBuffer(data: RetencionConstanciaPdfData): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50, size: 'A4' })
    const chunks: Buffer[] = []
    doc.on('data', (chunk: Buffer) => chunks.push(chunk))
    doc.on('end', () => resolve(Buffer.concat(chunks)))
    doc.on('error', reject)

    const { retencion, empresa, proveedor, fechaPago } = data
    const fechaStr = new Date(fechaPago).toLocaleDateString('es-AR')
    const tipoLabel = TIPO_LABELS[retencion.tipo] ?? retencion.regimenNombre

    doc.fontSize(16).text('Constancia de retención', { align: 'center' })
    doc.moveDown(0.5)
    doc.fontSize(10)
    doc.text(empresa.nombre, { align: 'center' })
    if (empresa.cuit) doc.text(`CUIT agente de retención: ${empresa.cuit}`, { align: 'center' })
    if (empresa.domicilio) doc.text(empresa.domicilio, { align: 'center' })
    doc.moveDown()

    doc.fontSize(12).text(`Constancia N° ${retencion.constanciaNum ?? retencion.id}`)
    doc.fontSize(10)
    doc.text(`Fecha: ${fechaStr}`)
    doc.text(`Régimen: ${tipoLabel} — ${retencion.regimenNombre}`)
    doc.moveDown(0.5)

    doc.text(`Sujeto retenido: ${proveedor.rsocial}`)
    if (proveedor.cuit) doc.text(`CUIT: ${proveedor.cuit}`)
    doc.moveDown()

    doc.fontSize(11).text('Detalle', { underline: true })
    doc.moveDown(0.25)
    doc.fontSize(10)
    doc.text(`Base imponible: $ ${retencion.baseImponible}`)
    doc.text(`Alícuota: ${retencion.alicuota} %`)
    doc.fontSize(12).text(`Importe retenido: $ ${retencion.importe}`, { underline: true })

    doc.end()
  })
}

export function retencionConstanciaPdfFilename(constanciaNum: string | null, id: number): string {
  const slug = (constanciaNum ?? `retencion-${id}`).replace(/[^\w-]+/g, '-')
  return `constancia-retencion-${slug}.pdf`
}
