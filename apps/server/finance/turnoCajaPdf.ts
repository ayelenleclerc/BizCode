import PDFDocument from 'pdfkit'
import type { TurnoCajaRowDb } from '../services/TurnoCajaService'

function money(value: unknown): string {
  const n = typeof value === 'number' ? value : Number(String(value ?? 0))
  return n.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

/**
 * @en Builds cash-shift close PDF (#247).
 * @es Genera PDF de cierre de turno de caja (#247).
 * @pt-BR Gera PDF de fechamento de turno de caixa (#247).
 */
export function buildTurnoCajaPdfBuffer(turno: TurnoCajaRowDb): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50, size: 'A4' })
    const chunks: Buffer[] = []
    doc.on('data', (chunk: Buffer) => chunks.push(chunk))
    doc.on('end', () => resolve(Buffer.concat(chunks)))
    doc.on('error', reject)

    doc.fontSize(16).text(`CIERRE DE TURNO #${turno.id}`, { align: 'center' })
    doc.moveDown()
    doc.fontSize(10)
    doc.text(`Caja: ${turno.caja?.nombre ?? turno.cajaId}`)
    doc.text(`Cajero: ${turno.cajero?.username ?? turno.cajeroId}`)
    doc.text(`Apertura: ${turno.fechaApertura.toISOString()}`)
    doc.text(`Cierre: ${turno.fechaCierre?.toISOString() ?? '—'}`)
    doc.text(`Monto apertura: $ ${money(turno.montoApertura)}`)
    doc.moveDown()

    doc.fontSize(11).text('Totales', { underline: true })
    doc.fontSize(10)
    doc.text(`Ventas efectivo: $ ${money(turno.totalVentasEfectivo)}`)
    doc.text(`Ventas tarjeta: $ ${money(turno.totalVentasTarjeta)}`)
    doc.text(`Ventas MP: $ ${money(turno.totalVentasMP)}`)
    doc.text(`Ventas transferencia: $ ${money(turno.totalVentasTransf)}`)
    doc.text(`Egresos: $ ${money(turno.totalEgresos)}`)
    doc.text(`Ingresos extra: $ ${money(turno.totalIngresosExtra)}`)
    doc.moveDown()
    doc.text(`Efectivo esperado: $ ${money(turno.efectivoEsperado)}`)
    doc.text(`Efectivo contado: $ ${money(turno.efectivoContado)}`)
    doc.text(`Diferencia: $ ${money(turno.diferencia)}`)
    if (turno.observaciones) {
      doc.moveDown(0.5)
      doc.text(`Observaciones: ${turno.observaciones}`)
    }

    if (turno.conteo) {
      doc.moveDown()
      doc.fontSize(11).text('Conteo físico', { underline: true })
      doc.fontSize(10)
      const c = turno.conteo
      doc.text(`$1000 x ${c.b1000} | $500 x ${c.b500} | $200 x ${c.b200} | $100 x ${c.b100}`)
      doc.text(`$50 x ${c.b50} | $20 x ${c.b20} | $10 x ${c.b10}`)
      doc.text(`Monedas $10 x ${c.m10} | $5 x ${c.m5} | $2 x ${c.m2} | $1 x ${c.m1}`)
      doc.text(`Total conteo: $ ${money(c.total)}`)
    }

    doc.end()
  })
}
