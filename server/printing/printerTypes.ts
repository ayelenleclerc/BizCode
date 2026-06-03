export type FiscalPrintPayload = {
  tenantId: number
  facturaId: number
  tipo: string
  prefijo: string
  numero: number
  total: number
}

export type ThermalPrintPayload = FiscalPrintPayload

export type PrinterExecution = {
  channel: 'fiscal_mock' | 'thermal_mock'
  jobId: string
  transport: 'mock-serial'
}

export interface IFiscalPrinter {
  printInvoice(payload: FiscalPrintPayload): Promise<PrinterExecution>
}

export interface IThermalPrinter {
  printTicket(payload: ThermalPrintPayload): Promise<PrinterExecution>
}
