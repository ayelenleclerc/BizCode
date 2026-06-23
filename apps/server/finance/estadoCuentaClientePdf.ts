import PDFDocument from 'pdfkit'
import type { ClienteEstadoCuentaPdfData } from '../services/ClienteCuentaCorrienteService'

/**
 * @en Builds customer account statement PDF (#232).
 * @es Genera PDF de estado de cuenta de cliente (#232).
 * @pt-BR Gera PDF de extrato de conta de cliente (#232).
 */
export function buildEstadoCuentaClientePdfBuffer(data: ClienteEstadoCuentaPdfData): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50, size: 'A4' })
    const chunks: Buffer[] = []
    doc.on('data', (chunk: Buffer) => chunks.push(chunk))
    doc.on('end', () => resolve(Buffer.concat(chunks)))
    doc.on('error', reject)

    doc.fontSize(16).text('Estado de cuenta — Cliente', { align: 'center' })
    doc.moveDown(0.5)
    doc.fontSize(10)
    doc.text(data.empresa.nombre, { align: 'center' })
    if (data.empresa.cuit) doc.text(`CUIT: ${data.empresa.cuit}`, { align: 'center' })
    if (data.empresa.domicilio) doc.text(data.empresa.domicilio, { align: 'center' })
    doc.moveDown()

    doc.fontSize(12).text(`${data.cliente.rsocial} (cód. ${data.cliente.codigo})`)
    doc.fontSize(10)
    if (data.cliente.cuit) doc.text(`CUIT: ${data.cliente.cuit}`)
    doc.text(`Período: ${data.desde} — ${data.hasta}`)
    doc.text(`Saldo actual: $ ${data.saldo}`)
    doc.moveDown()

    doc.fontSize(11).text('Movimientos', { underline: true })
    doc.moveDown(0.25)
    doc.fontSize(9)
    doc.text('Fecha       Tipo              Referencia              Debe        Haber       Saldo')
    doc.moveDown(0.15)

    for (const line of data.lineas) {
      const row = [
        line.fecha.padEnd(12),
        line.tipo.padEnd(18),
        line.referencia.slice(0, 22).padEnd(24),
        line.debito.padStart(10),
        line.credito.padStart(10),
        line.saldo.padStart(10),
      ].join(' ')
      doc.text(row)
    }

    doc.end()
  })
}
