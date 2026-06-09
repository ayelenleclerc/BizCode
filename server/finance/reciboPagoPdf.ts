import PDFDocument from 'pdfkit'
import type { ReciboPagoPdfData } from '../services/ReciboPagoService'

const METODO_LABELS: Record<string, string> = {
  transferencia: 'Transferencia',
  cheque: 'Cheque',
  efectivo: 'Efectivo',
  echeq: 'eCheq',
}

/**
 * @en Builds supplier payment receipt PDF (#271).
 * @es Genera PDF de recibo de pago a proveedor (#271).
 * @pt-BR Gera PDF de recibo de pagamento a fornecedor (#271).
 */
export function buildReciboPagoPdfBuffer(data: ReciboPagoPdfData): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50, size: 'A4' })
    const chunks: Buffer[] = []
    doc.on('data', (chunk: Buffer) => chunks.push(chunk))
    doc.on('end', () => resolve(Buffer.concat(chunks)))
    doc.on('error', reject)

    const { recibo, empresa } = data
    const fechaStr = new Date(recibo.fecha).toLocaleDateString('es-AR')

    doc.fontSize(16).text('Recibo de pago a proveedor', { align: 'center' })
    doc.moveDown(0.5)
    doc.fontSize(10)
    doc.text(empresa.nombre, { align: 'center' })
    if (empresa.cuit) doc.text(`CUIT: ${empresa.cuit}`, { align: 'center' })
    if (empresa.domicilio) doc.text(empresa.domicilio, { align: 'center' })
    doc.moveDown()

    doc.fontSize(12).text(`Recibo N° ${recibo.numero}`)
    doc.fontSize(10)
    doc.text(`Fecha: ${fechaStr}`)
    doc.text(`Proveedor: ${recibo.proveedor.rsocial} (cód. ${recibo.proveedor.codigo})`)
    if (recibo.proveedor.cuit) doc.text(`CUIT proveedor: ${recibo.proveedor.cuit}`)
    doc.text(`Estado: ${recibo.estado}`)
    doc.moveDown(0.5)

    doc.fontSize(11).text('Facturas imputadas', { underline: true })
    doc.moveDown(0.25)
    doc.fontSize(10)
    for (const line of recibo.facturas) {
      doc.text(`${line.facturaRef} — $ ${line.monto}`)
    }
    doc.moveDown()

    doc.fontSize(12).text(`Total pagado: $ ${recibo.total}`, { align: 'right' })
    doc.moveDown(0.5)
    doc.fontSize(10)
    doc.text(`Método de pago: ${METODO_LABELS[recibo.metodoPago] ?? recibo.metodoPago}`)
    if (recibo.cbu) doc.text(`CBU destino: ${recibo.cbu}`)
    if (recibo.referencia) doc.text(`Referencia: ${recibo.referencia}`)
    if (recibo.notas) doc.text(`Notas: ${recibo.notas}`)
    doc.moveDown()
    doc.text(`Registrado por: ${recibo.usuario.username}`)

    doc.end()
  })
}
