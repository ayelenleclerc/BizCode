import bwipjs from 'bwip-js'
import PDFDocument from 'pdfkit'
import type { PrismaClient } from '@prisma/client'
import type { ServiceResult } from '../../services/serviceResults'

export type FacturaPdfOptions = {
  preview: boolean
}

/**
 * @en Builds invoice PDF (issued CAE or watermarked preview).
 * @es Genera PDF de factura (CAE emitido o vista previa con marca de agua).
 * @pt-BR Gera PDF da fatura (CAE emitido ou pré-visualização com marca d'água).
 */
export async function buildFacturaPdfBuffer(
  prisma: PrismaClient,
  tenantId: number,
  facturaId: number,
  options: FacturaPdfOptions,
): Promise<ServiceResult<Buffer>> {
  const factura = await prisma.factura.findFirst({
    where: { id: facturaId, tenantId },
    include: {
      cliente: true,
      items: { include: { articulo: true } },
    },
  })
  if (!factura) {
    return { ok: false, status: 404, error: 'Factura not found' }
  }

  if (!options.preview) {
    if (factura.estadoCae !== 'issued' || !factura.cae) {
      return { ok: false, status: 422, error: 'CAE_NOT_ISSUED' }
    }
  }

  const empresaRow = await prisma.paramEmpresa.findUnique({ where: { tenantId } })
  const empresaNombre = empresaRow?.nombre ?? 'BizCode'
  const empresaCuit = empresaRow?.cuit ?? ''
  const empresaDomicilio = empresaRow?.domicilio ?? ''

  let barcodePng: Buffer | null = null
  if (!options.preview && factura.cae) {
    try {
      barcodePng = await bwipjs.toBuffer({
        bcid: 'code128',
        text: factura.cae,
        scale: 2,
        height: 12,
        includetext: false,
      })
    } catch {
      barcodePng = null
    }
  }

  const buffer = await renderPdf({
    empresaNombre,
    empresaCuit,
    empresaDomicilio,
    factura,
    preview: options.preview,
    barcodePng,
  })

  return { ok: true, data: buffer }
}

type RenderInput = {
  empresaNombre: string
  empresaCuit: string
  empresaDomicilio: string
  factura: {
    tipo: string
    prefijo: string
    numero: number
    fecha: Date
    total: { toString: () => string }
    neto1: { toString: () => string }
    neto2: { toString: () => string }
    neto3: { toString: () => string }
    iva1: { toString: () => string }
    iva2: { toString: () => string }
    cae: string | null
    caeVto: Date | null
    cliente: { rsocial: string; cuit: string | null; domicilio: string | null } | null
    items: Array<{
      cantidad: number
      precio: { toString: () => string }
      dscto: { toString: () => string }
      subtotal: { toString: () => string }
      articulo: { descripcion: string } | null
    }>
  }
  preview: boolean
  barcodePng: Buffer | null
}

function renderPdf(input: RenderInput): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50, size: 'A4' })
    const chunks: Buffer[] = []
    doc.on('data', (chunk: Buffer) => chunks.push(chunk))
    doc.on('end', () => resolve(Buffer.concat(chunks)))
    doc.on('error', reject)

    const { factura, preview } = input
    const numeroStr = `${factura.prefijo} ${String(factura.numero).padStart(8, '0')}`

    if (preview) {
      doc.fontSize(22).fillColor('red').text('VISTA PREVIA — SIN CAE', { align: 'center' })
      doc.fillColor('black')
      doc.moveDown()
    }

    doc.fontSize(16).text(input.empresaNombre, { align: 'left' })
    doc.fontSize(10).text(`CUIT: ${input.empresaCuit}`)
    if (input.empresaDomicilio) {
      doc.text(input.empresaDomicilio)
    }
    doc.moveDown()

    doc.fontSize(14).text(`Factura ${factura.tipo} ${numeroStr}`)
    doc.fontSize(10).text(`Fecha: ${factura.fecha.toISOString().slice(0, 10)}`)
    if (factura.cliente) {
      doc.text(`Cliente: ${factura.cliente.rsocial}`)
      if (factura.cliente.cuit) doc.text(`CUIT: ${factura.cliente.cuit}`)
      if (factura.cliente.domicilio) doc.text(factura.cliente.domicilio)
    }
    doc.moveDown()

    doc.fontSize(11).text('Detalle', { underline: true })
    doc.moveDown(0.5)
    for (const item of factura.items) {
      const desc = item.articulo?.descripcion ?? '—'
      doc.text(
        `${desc} — cant: ${item.cantidad} — $${Number(item.subtotal).toFixed(2)}`,
      )
    }
    doc.moveDown()

    doc.text(`Neto 21%: $${Number(factura.neto1).toFixed(2)}`)
    doc.text(`Neto 10.5%: $${Number(factura.neto2).toFixed(2)}`)
    doc.text(`Exento: $${Number(factura.neto3).toFixed(2)}`)
    doc.text(`IVA 21%: $${Number(factura.iva1).toFixed(2)}`)
    doc.text(`IVA 10.5%: $${Number(factura.iva2).toFixed(2)}`)
    doc.fontSize(12).text(`Total: $${Number(factura.total).toFixed(2)}`, { underline: true })

    if (!preview && factura.cae) {
      doc.moveDown()
      doc.fontSize(11).text(`CAE: ${factura.cae}`)
      if (factura.caeVto) {
        doc.text(`Vto CAE: ${factura.caeVto.toISOString().slice(0, 10)}`)
      }
      if (input.barcodePng) {
        doc.moveDown(0.5)
        doc.image(input.barcodePng, { width: 200 })
      }
    }

    doc.end()
  })
}

export function facturaPdfFilename(facturaId: number, preview: boolean): string {
  return preview ? `factura-${facturaId}-preview.pdf` : `factura-${facturaId}.pdf`
}
