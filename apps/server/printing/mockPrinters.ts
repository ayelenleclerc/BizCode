import type {
  FiscalPrintPayload,
  IFiscalPrinter,
  IThermalPrinter,
  PrinterExecution,
  ThermalPrintPayload,
} from './printerTypes'

function buildMockJobId(prefix: string, facturaId: number): string {
  return `${prefix}-${facturaId}-${Date.now()}`
}

export class MockFiscalPrinterAdapter implements IFiscalPrinter {
  async printInvoice(payload: FiscalPrintPayload): Promise<PrinterExecution> {
    return {
      channel: 'fiscal_mock',
      jobId: buildMockJobId('fiscal', payload.facturaId),
      transport: 'mock-serial',
    }
  }
}

export class MockThermalPrinterAdapter implements IThermalPrinter {
  async printTicket(payload: ThermalPrintPayload): Promise<PrinterExecution> {
    return {
      channel: 'thermal_mock',
      jobId: buildMockJobId('thermal', payload.facturaId),
      transport: 'mock-serial',
    }
  }
}
