import PDFDocument from 'pdfkit'
import { montoEnLetrasArs } from '../lib/montoEnLetras'
import type { ReciboCobroPdfData } from '../services/ReciboCobroService'

const FORMA_LABELS: Record<string, string> = {
  efectivo: 'Efectivo',
  transferencia: 'Transferencia',
  cheque: 'Cheque',
  mercadopago: 'Mercado Pago',
  tarjeta: 'Tarjeta',
  otro: 'Otro',
}

/**
 * @en Builds customer payment receipt PDF (#233).
 * @es Genera PDF de recibo de cobro a cliente (#233).
 * @pt-BR Gera PDF de recibo de cobrança de cliente (#233).
 */
export function buildReciboCobroPdfBuffer(data: ReciboCobroPdfData): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50, size: 'A4' })
    const chunks: Buffer[] = []
    doc.on('data', (chunk: Buffer) => chunks.push(chunk))
    doc.on('end', () => resolve(Buffer.concat(chunks)))
    doc.on('error', reject)

    const { recibo, empresa } = data
    const fechaStr = new Date(recibo.fecha).toLocaleDateString('es-AR')

    doc.fontSize(18).text(`RECIBO N° ${recibo.numero}`, { align: 'center' })
    doc.moveDown(0.5)
    doc.fontSize(10)
    doc.text(empresa.nombre, { align: 'center' })
    if (empresa.cuit) doc.text(`CUIT: ${empresa.cuit}`, { align: 'center' })
    if (empresa.domicilio) doc.text(empresa.domicilio, { align: 'center' })
    doc.moveDown()

    doc.fontSize(10)
    doc.text(`Fecha: ${fechaStr}`)
    doc.text(`Cliente: ${recibo.cliente.rsocial} (cód. ${recibo.cliente.codigo})`)
    if (recibo.cliente.cuit) doc.text(`CUIT cliente: ${recibo.cliente.cuit}`)
    doc.moveDown(0.5)

    doc.fontSize(11).text(
      `Recibí de ${recibo.cliente.rsocial} la suma de $ ${recibo.totalBruto}`,
      { align: 'left' },
    )
    doc.fontSize(10).text(`(${montoEnLetrasArs(recibo.totalBruto)})`, { align: 'left' })
    doc.moveDown()

    if (recibo.concepto) {
      doc.text(`Concepto: ${recibo.concepto}`)
      doc.moveDown(0.5)
    }

    doc.fontSize(11).text('Formas de pago', { underline: true })
    doc.moveDown(0.25)
    doc.fontSize(10)
    for (const forma of recibo.formas) {
      let line = `${FORMA_LABELS[forma.tipo] ?? forma.tipo}: $ ${forma.importe}`
      if (forma.chequeNumero) {
        line += ` — Cheque N° ${forma.chequeNumero}`
        if (forma.chequeBanco) line += ` (${forma.chequeBanco})`
      }
      if (forma.referencia) line += ` — Ref: ${forma.referencia}`
      if (forma.banco) line += ` — Banco: ${forma.banco}`
      doc.text(line)
    }
    doc.moveDown()

    if (recibo.imputaciones.length > 0) {
      doc.fontSize(11).text('Imputación a facturas', { underline: true })
      doc.moveDown(0.25)
      doc.fontSize(10)
      for (const imp of recibo.imputaciones) {
        doc.text(
          `${imp.facturaRef}: $ ${imp.importe} (saldo previo $ ${imp.saldoPrevio} → $ ${imp.saldoPostPago})`,
        )
      }
      doc.moveDown()
    }

    if (recibo.retenciones.length > 0) {
      doc.fontSize(11).text('Retenciones aplicadas', { underline: true })
      doc.moveDown(0.25)
      doc.fontSize(10)
      for (const ret of recibo.retenciones) {
        doc.text(`${ret.regimenNombre}: $ ${ret.importe}`)
      }
      doc.moveDown()
    }

    doc.fontSize(10)
    doc.text('Recibí conforme.', { align: 'left' })
    doc.moveDown(2)
    doc.text(`Cobrador: ${recibo.usuario.username}`)
    doc.text(`Estado: ${recibo.estado}`)

    doc.end()
  })
}
