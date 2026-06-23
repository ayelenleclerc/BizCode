import { createRequire } from 'node:module'
import type { LibroIvaComprasPreview } from '../../services/LibroIvaComprasService'

const require = createRequire(import.meta.url)
const ExcelJS = require('exceljs') as typeof import('exceljs')

/**
 * @en Internal review workbook for Libro IVA Compras (#306).
 * @es Planilla Excel de revisión interna del Libro IVA Compras (#306).
 * @pt-BR Planilha Excel de revisão interna do Livro IVA Compras (#306).
 */
export async function buildLibroIvaComprasExcel(preview: LibroIvaComprasPreview): Promise<Buffer> {
  const workbook = new ExcelJS.Workbook()
  workbook.creator = 'BizCode'
  workbook.created = new Date()

  const summary = workbook.addWorksheet('Resumen')
  summary.addRow(['Periodo', preview.periodo])
  summary.addRow(['Registros CBTU', preview.recordCountCbtu])
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

  const cbtu = workbook.addWorksheet('CBTU')
  cbtu.addRow(['Linea'])
  for (const line of preview.cbtuLines) {
    cbtu.addRow([line])
  }

  const alic = workbook.addWorksheet('ALICUOTAS')
  alic.addRow(['Linea'])
  for (const line of preview.alicuotasLines) {
    alic.addRow([line])
  }

  const buffer = await workbook.xlsx.writeBuffer()
  return Buffer.from(buffer)
}
