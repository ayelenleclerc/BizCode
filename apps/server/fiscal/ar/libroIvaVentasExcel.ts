import { createRequire } from 'node:module'
import type { LibroIvaVentasPreview } from '../../services/LibroIvaVentasService'

const require = createRequire(import.meta.url)
const ExcelJS = require('exceljs') as typeof import('exceljs')

/**
 * @en Internal review workbook for Libro IVA Ventas (#147).
 * @es Planilla Excel de revisión interna del Libro IVA Ventas (#147).
 * @pt-BR Planilha Excel de revisão interna do Livro IVA Vendas (#147).
 */
export async function buildLibroIvaVentasExcel(preview: LibroIvaVentasPreview): Promise<Buffer> {
  const workbook = new ExcelJS.Workbook()
  workbook.creator = 'BizCode'
  workbook.created = new Date()

  const summary = workbook.addWorksheet('Resumen')
  summary.addRow(['Periodo', preview.periodo])
  summary.addRow(['Registros CBTV', preview.recordCountCbtv])
  summary.addRow(['Registros ALICUOTAS', preview.recordCountAlicuotas])
  summary.addRow(['Total neto gravado', preview.totalNeto])
  summary.addRow(['Total IVA', preview.totalIva])
  summary.addRow(['Total exento', preview.totalExento])
  summary.addRow(['Total general', preview.totalGeneral])

  const alicuotas = workbook.addWorksheet('TotalesAlicuota')
  alicuotas.addRow(['Codigo', 'Neto', 'IVA'])
  for (const row of preview.totalsByAlicuota) {
    alicuotas.addRow([row.alicuotaCode, row.neto, row.iva])
  }

  const cbtv = workbook.addWorksheet('CBTV')
  cbtv.addRow(['Linea'])
  for (const line of preview.cbtvLines) {
    cbtv.addRow([line])
  }

  const alic = workbook.addWorksheet('ALICUOTAS')
  alic.addRow(['Linea'])
  for (const line of preview.alicuotasLines) {
    alic.addRow([line])
  }

  const buffer = await workbook.xlsx.writeBuffer()
  return Buffer.from(buffer)
}
