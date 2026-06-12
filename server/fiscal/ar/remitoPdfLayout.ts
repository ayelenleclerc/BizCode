import PDFDocument from 'pdfkit'
import { condicionIvaPdfLabel } from './arcaCondicionIvaLabels'
import type { CondicionIvaCode } from './arcaFiscalPdfTypes'

function parseCondicionIva(value: string | null | undefined): CondicionIvaCode | null {
  if (value === 'RI' || value === 'Mono' || value === 'CF' || value === 'Exento') return value
  return null
}

export type RemitoPdfInput = {
  empresa: {
    nombre: string
    cuit: string
    domicilio: string | null
    condicionIva: string | null
  }
  remito: {
    referencia: string
    prefijo: string | null
    numero: number | null
    tipo: string
    fecha: Date
    observaciones: string | null
    firmadoPor: string | null
    cliente: {
      rsocial: string
      cuit: string | null
      domicilio: string | null
      condIva: string
    } | null
    proveedor: {
      rsocial: string
      cuit: string | null
    } | null
    items: Array<{
      descripcion: string
      cantidad: number
      unidad: string
    }>
  }
}

function formatDate(d: Date): string {
  return d.toISOString().slice(0, 10)
}

/**
 * @en Renders legal delivery note PDF without prices (#230).
 * @es Renderiza PDF de remito legal sin precios (#230).
 * @pt-BR Renderiza PDF de remessa legal sem preços (#230).
 */
export function renderRemitoPdfA4(input: RemitoPdfInput): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 40, size: 'A4' })
    const chunks: Buffer[] = []
    doc.on('data', (chunk: Buffer) => chunks.push(chunk))
    doc.on('end', () => resolve(Buffer.concat(chunks)))
    doc.on('error', reject)

    const { empresa, remito } = input
    const numeroDisplay =
      remito.prefijo != null && remito.numero != null
        ? `${remito.prefijo}-${String(remito.numero).padStart(8, '0')}`
        : 'BORRADOR'

    doc.fontSize(22).text('REMITO X', { align: 'center' })
    doc.moveDown(0.3)
    doc.fontSize(10)
    doc.text(empresa.nombre, { align: 'center' })
    doc.text(`CUIT: ${empresa.cuit}`, { align: 'center' })
    if (empresa.domicilio) doc.text(`Domicilio: ${empresa.domicilio}`, { align: 'center' })
    const empresaCond = parseCondicionIva(empresa.condicionIva)
    if (empresaCond) {
      doc.text(`Condición IVA: ${condicionIvaPdfLabel(empresaCond)}`, { align: 'center' })
    }

    doc.moveDown()
    doc.fontSize(11).text(`Remito Nº ${numeroDisplay}`, { align: 'right' })
    doc.text(`Fecha: ${formatDate(remito.fecha)}`, { align: 'right' })
    doc.text(`Tipo: ${remito.tipo === 'remito_ingreso' ? 'Remito de ingreso' : 'Remito de salida'}`, { align: 'right' })
    doc.moveDown()

    const destino = remito.cliente ?? remito.proveedor
    if (destino) {
      doc.fontSize(11).text('Destino / receptor', { underline: true })
      doc.fontSize(10)
      doc.text(`Razón social: ${destino.rsocial}`)
      if (destino.cuit) doc.text(`CUIT: ${destino.cuit}`)
      if ('domicilio' in destino && destino.domicilio) doc.text(`Domicilio: ${destino.domicilio}`)
      if ('condIva' in destino && typeof destino.condIva === 'string') {
        const cond = parseCondicionIva(destino.condIva)
        if (cond) doc.text(`Condición IVA: ${condicionIvaPdfLabel(cond)}`)
      }
      doc.moveDown()
    }

    const tableTop = doc.y + 4
    doc.fontSize(9)
    doc.text('Artículo / descripción', 40, tableTop)
    doc.text('Cantidad', 380, tableTop, { width: 60, align: 'right' })
    doc.text('Unidad', 460, tableTop, { width: 80, align: 'right' })
    doc.moveTo(40, tableTop + 14).lineTo(555, tableTop + 14).stroke()

    let y = tableTop + 18
    for (const item of remito.items) {
      doc.text(item.descripcion, 40, y, { width: 320 })
      doc.text(String(item.cantidad), 380, y, { width: 60, align: 'right' })
      doc.text(item.unidad, 460, y, { width: 80, align: 'right' })
      y += 16
    }

    if (remito.observaciones) {
      doc.moveDown()
      doc.fontSize(10).text(`Observaciones: ${remito.observaciones}`)
    }

    doc.moveDown(2)
    doc.text('Firma del receptor: _________________________________', 40, doc.y)
    doc.moveDown(0.5)
    doc.text('Aclaración: _________________________________________', 40, doc.y)
    if (remito.firmadoPor) {
      doc.moveDown(0.5)
      doc.text(`Recibí conforme: ${remito.firmadoPor}`)
    }

    doc.end()
  })
}
