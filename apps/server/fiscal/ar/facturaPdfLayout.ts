import PDFDocument from 'pdfkit'
import { condicionIvaPdfLabel } from './arcaCondicionIvaLabels'
import type { ArcaFacturaPdfInput } from './arcaFiscalPdfTypes'
import type { FacturaPdfImages } from './facturaPdfImages'

function formatMoney(value: number): string {
  return `$${value.toFixed(2)}`
}

function formatDate(d: Date): string {
  return d.toISOString().slice(0, 10)
}

/**
 * @en Renders A4 fiscal invoice PDF (legal or watermarked preview).
 * @es Renderiza PDF A4 de factura fiscal (legal o vista previa).
 * @pt-BR Renderiza PDF A4 de fatura fiscal (legal ou pré-visualização).
 */
export function renderFacturaPdfA4(
  input: ArcaFacturaPdfInput,
  images: FacturaPdfImages,
): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 40, size: 'A4' })
    const chunks: Buffer[] = []
    doc.on('data', (chunk: Buffer) => chunks.push(chunk))
    doc.on('end', () => resolve(Buffer.concat(chunks)))
    doc.on('error', reject)

    const { factura, empresa, preview } = input
    const numeroStr = `${factura.prefijo}-${String(factura.numero).padStart(8, '0')}`

    if (preview) {
      doc.fontSize(20).fillColor('#cc0000').text('VISTA PREVIA — NO FISCAL / SIN CAE', { align: 'center' })
      doc.fillColor('#000000')
      doc.moveDown(0.5)
    }

    doc.fontSize(10)
    doc.text(empresa.nombre, { continued: false })
    doc.text(`CUIT: ${empresa.cuit}`)
    if (empresa.domicilio) doc.text(`Domicilio comercial: ${empresa.domicilio}`)
    if (empresa.ingresosBrutos) doc.text(`Ingresos Brutos: ${empresa.ingresosBrutos}`)
    if (empresa.fechaInicioActividades) {
      doc.text(`Inicio de actividades: ${formatDate(empresa.fechaInicioActividades)}`)
    }
    if (empresa.condicionIva) {
      doc.text(`Condición frente al IVA: ${condicionIvaPdfLabel(empresa.condicionIva)}`)
    }

    doc.moveDown()
    const letterY = doc.y
    doc.fontSize(48).text(factura.tipo, 480, letterY, { width: 60, align: 'center' })
    doc.fontSize(10)
    doc.text(`Comprobante: Factura ${factura.tipo}`, 40, letterY)
    doc.text(`Punto de venta: ${factura.prefijo}  Nº: ${String(factura.numero).padStart(8, '0')}`)
    doc.text(`Fecha de emisión: ${formatDate(factura.fecha)}`)
    doc.moveDown()

    if (factura.cliente) {
      doc.fontSize(11).text('Datos del receptor', { underline: true })
      doc.fontSize(10)
      doc.text(`Razón social: ${factura.cliente.rsocial}`)
      if (factura.cliente.cuit) doc.text(`CUIT/DNI: ${factura.cliente.cuit}`)
      if (factura.cliente.domicilio) doc.text(`Domicilio: ${factura.cliente.domicilio}`)
      doc.text(`Condición IVA: ${condicionIvaPdfLabel(factura.cliente.condIva)}`)
      doc.moveDown()
    }

    const tableTop = doc.y + 4
    doc.fontSize(9)
    doc.text('Descripción', 40, tableTop)
    doc.text('Cant.', 280, tableTop, { width: 40, align: 'right' })
    doc.text('P. unit.', 330, tableTop, { width: 55, align: 'right' })
    doc.text('Dto %', 395, tableTop, { width: 40, align: 'right' })
    doc.text('Subtotal', 450, tableTop, { width: 100, align: 'right' })
    doc.moveTo(40, tableTop + 14).lineTo(555, tableTop + 14).stroke()

    let y = tableTop + 18
    for (const item of factura.items) {
      doc.text(item.descripcion.slice(0, 42), 40, y, { width: 230 })
      doc.text(String(item.cantidad), 280, y, { width: 40, align: 'right' })
      doc.text(formatMoney(item.precio), 330, y, { width: 55, align: 'right' })
      doc.text(item.dscto.toFixed(1), 395, y, { width: 40, align: 'right' })
      doc.text(formatMoney(item.subtotal), 450, y, { width: 100, align: 'right' })
      y += 16
      if (item.monedaOrigen && item.precioOrigen != null && item.tipoCambioValor != null) {
        doc
          .fontSize(7)
          .fillColor('#555555')
          .text(
            `Origen ${item.monedaOrigen} ${item.precioOrigen.toFixed(4)} × TC ${item.tipoCambioValor.toFixed(4)}`,
            40,
            y,
            { width: 510 },
          )
        doc.fillColor('#000000').fontSize(9)
        y += 12
      }
    }

    doc.y = y + 8
    doc.fontSize(10)
    if (factura.neto1 > 0) doc.text(`Neto gravado 21%: ${formatMoney(factura.neto1)}`)
    if (factura.neto2 > 0) doc.text(`Neto gravado 10,5%: ${formatMoney(factura.neto2)}`)
    if (factura.neto3 > 0) doc.text(`Exento: ${formatMoney(factura.neto3)}`)
    if (factura.iva1 > 0) doc.text(`IVA 21%: ${formatMoney(factura.iva1)}`)
    if (factura.iva2 > 0) doc.text(`IVA 10,5%: ${formatMoney(factura.iva2)}`)
    for (const percepcion of factura.percepciones) {
      doc.text(`${percepcion.nombre}: ${formatMoney(percepcion.importe)}`)
    }
    doc.fontSize(12).text(`Importe total: ${formatMoney(factura.total)}`, { underline: true })
    if (
      factura.tipoCambioValor != null &&
      factura.tipoCambioMoneda &&
      factura.tipoCambioTipo
    ) {
      doc.moveDown(0.3)
      const fechaTc = factura.tipoCambioFecha ? formatDate(factura.tipoCambioFecha) : '—'
      doc
        .fontSize(9)
        .text(
          `Tipo de cambio aplicado: ${factura.tipoCambioMoneda} ${factura.tipoCambioTipo} = ${factura.tipoCambioValor.toFixed(4)} (${fechaTc})`,
        )
    }

    if (!preview && factura.cae) {
      doc.moveDown()
      doc.fontSize(10).text(`CAE Nº: ${factura.cae}`)
      if (factura.caeVto) doc.text(`Fecha vto. CAE: ${formatDate(factura.caeVto)}`)
      doc.moveDown(0.5)
      doc.text('Comprobante Autorizado por ARCA', { align: 'center' })
      if (images.qrPng) {
        const qrX = (doc.page.width - 100) / 2
        doc.image(images.qrPng, qrX, doc.y + 4, { width: 100, height: 100 })
        doc.y += 108
      }
      if (images.barcodePng) {
        const bcX = (doc.page.width - 320) / 2
        doc.image(images.barcodePng, bcX, doc.y + 4, { width: 320, height: 40 })
        doc.y += 48
      }
    }

    doc.fontSize(8).fillColor('#666666').text(`Ref. interna: ${numeroStr}`, 40, doc.page.height - 50, {
      align: 'left',
    })
    if (input.loyaltyFooter) {
      doc
        .fontSize(8)
        .fillColor('#000000')
        .text(input.loyaltyFooter, 40, doc.page.height - 36, { align: 'left', width: doc.page.width - 80 })
    }

    doc.end()
  })
}

/**
 * @en Renders 80mm thermal ticket (operational; not a valid fiscal voucher without issued CAE).
 * @es Ticket 80mm operativo (no fiscal válido sin CAE emitido).
 * @pt-BR Ticket 80mm operacional (não fiscal válido sem CAE emitido).
 */
export function renderFacturaTicket80mm(input: ArcaFacturaPdfInput): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const widthPt = (80 / 25.4) * 72
    const doc = new PDFDocument({ margin: 12, size: [widthPt, 600] })
    const chunks: Buffer[] = []
    doc.on('data', (chunk: Buffer) => chunks.push(chunk))
    doc.on('end', () => resolve(Buffer.concat(chunks)))
    doc.on('error', reject)

    const { factura, empresa, preview } = input
    const fiscal = !preview && !!factura.cae

    doc.fontSize(10).text(empresa.nombre, { align: 'center' })
    doc.fontSize(8).text(`CUIT ${empresa.cuit}`, { align: 'center' })
    doc.moveDown(0.3)

    if (!fiscal) {
      doc.fontSize(9).fillColor('#cc0000').text('TICKET NO FISCAL', { align: 'center' })
      doc.fillColor('#000000')
    }

    doc.fontSize(9).text(`Factura ${factura.tipo} ${factura.prefijo}-${factura.numero}`, { align: 'center' })
    doc.text(formatDate(factura.fecha), { align: 'center' })
    if (factura.cliente) {
      doc.text(factura.cliente.rsocial.slice(0, 28), { align: 'center' })
    }
    doc.moveDown(0.3)

    for (const item of factura.items) {
      doc.fontSize(8).text(`${item.descripcion.slice(0, 24)} x${item.cantidad} ${formatMoney(item.subtotal)}`)
    }

    doc.moveDown(0.3)
    doc.fontSize(10).text(`TOTAL ${formatMoney(factura.total)}`, { align: 'center' })
    if (
      factura.tipoCambioValor != null &&
      factura.tipoCambioMoneda &&
      factura.tipoCambioTipo
    ) {
      doc
        .fontSize(7)
        .text(
          `TC ${factura.tipoCambioMoneda} ${factura.tipoCambioTipo} ${factura.tipoCambioValor.toFixed(4)}`,
          { align: 'center' },
        )
    }

    if (fiscal && factura.cae) {
      doc.fontSize(7).text(`CAE ${factura.cae}`, { align: 'center' })
    }
    if (input.loyaltyFooter) {
      doc.moveDown(0.3)
      doc.fontSize(7).text(input.loyaltyFooter, { align: 'center' })
    }

    doc.end()
  })
}
