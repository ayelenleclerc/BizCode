import type { PrismaClient } from '@prisma/client'
import { MockFiscalPrinterAdapter, MockThermalPrinterAdapter } from '../printing/mockPrinters'
import type { IFiscalPrinter, IThermalPrinter } from '../printing/printerTypes'
import type { ServiceResult } from './serviceResults'

export type FacturaPrintDevice = 'pdf' | 'fiscal' | 'thermal'

export type FacturaPrintResult = {
  device: FacturaPrintDevice
  channel: 'pdf' | 'fiscal_mock' | 'thermal_mock'
  fallbackToPdf: boolean
  downloadPath?: string
  jobId?: string
  transport?: 'mock-serial'
}

export type FacturaPrintRequest = {
  tenantId: number
  facturaId: number
  device: FacturaPrintDevice
}

export type FacturaPrintDependencies = {
  fiscalPrinter: IFiscalPrinter
  thermalPrinter: IThermalPrinter
}

export type PrintingStatus = {
  fiscalPrinterEnabled: boolean
  fiscalMode: 'mock'
  thermalMode: 'mock'
}

export type PrintingTestDevice = 'fiscal' | 'thermal'

export type PrintingTestResult = {
  device: PrintingTestDevice
  channel: 'pdf' | 'fiscal_mock' | 'thermal_mock'
  fallbackToPdf: boolean
  jobId?: string
  transport?: 'mock-serial'
}

export function isFiscalPrinterEnabled(): boolean {
  return process.env.FISCAL_PRINTER_ENABLED === 'true'
}

export function getPrintingStatus(): PrintingStatus {
  return {
    fiscalPrinterEnabled: isFiscalPrinterEnabled(),
    fiscalMode: 'mock',
    thermalMode: 'mock',
  }
}

const TEST_PRINT_PAYLOAD = {
  tenantId: 0,
  facturaId: 0,
  tipo: 'B',
  prefijo: '0000',
  numero: 0,
  total: 0,
} as const

export async function runPrintingTest(
  device: PrintingTestDevice,
  deps?: Partial<FacturaPrintDependencies>,
): Promise<PrintingTestResult> {
  if (device === 'fiscal' && !isFiscalPrinterEnabled()) {
    return {
      device: 'fiscal',
      channel: 'pdf',
      fallbackToPdf: true,
    }
  }

  const fiscalPrinter = deps?.fiscalPrinter ?? new MockFiscalPrinterAdapter()
  const thermalPrinter = deps?.thermalPrinter ?? new MockThermalPrinterAdapter()

  if (device === 'fiscal') {
    const printed = await fiscalPrinter.printInvoice(TEST_PRINT_PAYLOAD)
    return {
      device: 'fiscal',
      channel: printed.channel,
      fallbackToPdf: false,
      jobId: printed.jobId,
      transport: printed.transport,
    }
  }

  const printed = await thermalPrinter.printTicket(TEST_PRINT_PAYLOAD)
  return {
    device: 'thermal',
    channel: printed.channel,
    fallbackToPdf: false,
    jobId: printed.jobId,
    transport: printed.transport,
  }
}

export class FacturaPrintService {
  private readonly fiscalPrinter: IFiscalPrinter

  private readonly thermalPrinter: IThermalPrinter

  constructor(
    private readonly prisma: PrismaClient,
    deps?: Partial<FacturaPrintDependencies>,
  ) {
    this.fiscalPrinter = deps?.fiscalPrinter ?? new MockFiscalPrinterAdapter()
    this.thermalPrinter = deps?.thermalPrinter ?? new MockThermalPrinterAdapter()
  }

  async print(req: FacturaPrintRequest): Promise<ServiceResult<FacturaPrintResult>> {
    const factura = await this.prisma.factura.findFirst({
      where: { id: req.facturaId, tenantId: req.tenantId },
      select: { id: true, tipo: true, prefijo: true, numero: true, total: true },
    })

    if (!factura) {
      return { ok: false, status: 404, error: 'Factura not found' }
    }

    if (req.device === 'pdf') {
      return {
        ok: true,
        data: {
          device: 'pdf',
          channel: 'pdf',
          fallbackToPdf: false,
          downloadPath: `/api/facturas/${factura.id}/pdf`,
        },
      }
    }

    if (req.device === 'fiscal') {
      if (!isFiscalPrinterEnabled()) {
        return {
          ok: true,
          data: {
            device: 'fiscal',
            channel: 'pdf',
            fallbackToPdf: true,
            downloadPath: `/api/facturas/${factura.id}/pdf`,
          },
        }
      }

      const printed = await this.fiscalPrinter.printInvoice({
        tenantId: req.tenantId,
        facturaId: factura.id,
        tipo: factura.tipo,
        prefijo: factura.prefijo,
        numero: factura.numero,
        total: Number(factura.total),
      })
      return {
        ok: true,
        data: {
          device: 'fiscal',
          channel: printed.channel,
          fallbackToPdf: false,
          jobId: printed.jobId,
          transport: printed.transport,
        },
      }
    }

    const printed = await this.thermalPrinter.printTicket({
      tenantId: req.tenantId,
      facturaId: factura.id,
      tipo: factura.tipo,
      prefijo: factura.prefijo,
      numero: factura.numero,
      total: Number(factura.total),
    })
    return {
      ok: true,
      data: {
        device: 'thermal',
        channel: printed.channel,
        fallbackToPdf: false,
        jobId: printed.jobId,
        transport: printed.transport,
      },
    }
  }
}
