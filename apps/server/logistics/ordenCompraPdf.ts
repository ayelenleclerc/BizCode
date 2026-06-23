import PDFDocument from 'pdfkit'
import type { OrdenCompraRow } from '../services/CompraService'

export type OrdenCompraPdfProveedor = {
  rsocial: string
  codigo: number
  cuit: string | null
}

export type OrdenCompraPdfData = {
  orden: OrdenCompraRow
  proveedor: OrdenCompraPdfProveedor
}

function lineCodigo(item: OrdenCompraRow['items'][number]): string {
  if (item.codigoProveedor?.trim()) return item.codigoProveedor.trim()
  return String(item.articulo?.codigo ?? item.articuloId)
}

function lineDescripcion(item: OrdenCompraRow['items'][number]): string {
  if (item.descripcionProveedor?.trim()) return item.descripcionProveedor.trim()
  return item.articulo?.descripcion ?? `Artículo #${item.articuloId}`
}

/**
 * @en Builds purchase order PDF with supplier catalog codes (#323).
 * @es Genera PDF de orden de compra con códigos de catálogo del proveedor (#323).
 * @pt-BR Gera PDF de ordem de compra com códigos do catálogo do fornecedor (#323).
 */
export function buildOrdenCompraPdfBuffer(data: OrdenCompraPdfData): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50, size: 'A4' })
    const chunks: Buffer[] = []
    doc.on('data', (chunk: Buffer) => chunks.push(chunk))
    doc.on('end', () => resolve(Buffer.concat(chunks)))
    doc.on('error', reject)

    const { orden, proveedor } = data
    const fechaStr = orden.fechaEstimada
      ? new Date(orden.fechaEstimada).toLocaleDateString('es-AR')
      : new Date(orden.createdAt).toLocaleDateString('es-AR')

    doc.fontSize(16).text('Orden de compra', { align: 'center' })
    doc.moveDown(0.5)
    doc.fontSize(12).text(`OC #${orden.id}`, { align: 'center' })
    doc.moveDown()

    doc.fontSize(10)
    doc.text(`Proveedor: ${proveedor.rsocial} (cód. ${proveedor.codigo})`)
    if (proveedor.cuit) doc.text(`CUIT: ${proveedor.cuit}`)
    doc.text(`Estado: ${orden.estado}`)
    doc.text(`Fecha estimada: ${fechaStr}`)
    if (orden.nota) doc.text(`Nota: ${orden.nota}`)
    doc.moveDown()

    doc.fontSize(11).text('Ítems', { underline: true })
    doc.moveDown(0.25)
    doc.fontSize(9)
    for (const item of orden.items) {
      const codigo = lineCodigo(item)
      const descripcion = lineDescripcion(item)
      const costo = Number.parseFloat(String(item.costoUnitario))
      const subtotal = Number.parseFloat(String(item.subtotal))
      doc.text(
        `${codigo} — ${descripcion} | cant. ${item.cantidad} × $ ${costo.toFixed(2)} = $ ${subtotal.toFixed(2)}`,
      )
    }
    doc.moveDown()
    doc.fontSize(12).text(`Total: $ ${Number.parseFloat(String(orden.total)).toFixed(2)}`, {
      align: 'right',
    })

    doc.end()
  })
}

export function ordenCompraPdfFilename(ordenId: number): string {
  return `orden-compra-${ordenId}.pdf`
}
