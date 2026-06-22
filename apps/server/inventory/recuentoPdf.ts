import PDFDocument from 'pdfkit'
import type { RecuentoRow } from '../services/RecuentoService'

export type RecuentoPdfRow = RecuentoRow

/**
 * @en Builds inventory count difference report PDF (closed counts only).
 * @es Genera PDF de diferencias del recuento (solo recuentos cerrados).
 * @pt-BR Gera PDF de diferenças da contagem (somente contagens fechadas).
 */
export function buildRecuentoPdfBuffer(recuento: RecuentoPdfRow): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50, size: 'A4' })
    const chunks: Buffer[] = []
    doc.on('data', (chunk: Buffer) => chunks.push(chunk))
    doc.on('end', () => resolve(Buffer.concat(chunks)))
    doc.on('error', reject)

    doc.fontSize(16).text('Physical inventory count report', { align: 'center' })
    doc.moveDown(0.5)
    doc.fontSize(10).text(`Count #${recuento.id}`)
    doc.text(`Operator: ${recuento.operador.username}`)
    doc.text(`Closed: ${recuento.closedAt?.toISOString() ?? '—'}`)
    doc.moveDown()

    const withDiff = recuento.items.filter(
      (i) => i.cantFisica !== null && i.cantFisica - i.cantSistema !== 0,
    )
    const matched = recuento.items.filter(
      (i) => i.cantFisica !== null && i.cantFisica - i.cantSistema === 0,
    )

    doc.fontSize(12).text(`Lines with difference: ${withDiff.length}`)
    doc.text(`Lines matched: ${matched.length}`)
    doc.moveDown()

    if (withDiff.length === 0) {
      doc.text('No stock differences.')
    } else {
      doc.fontSize(10)
      for (const item of withDiff) {
        const diff = item.cantFisica! - item.cantSistema
        doc.text(
          `${item.articulo.codigo} — ${item.articulo.descripcion}: system ${item.cantSistema}, physical ${item.cantFisica}, diff ${diff > 0 ? '+' : ''}${diff}`,
        )
      }
    }

    doc.end()
  })
}

export function recuentoPdfFilename(recuentoId: number): string {
  return `recuento-${recuentoId}.pdf`
}
