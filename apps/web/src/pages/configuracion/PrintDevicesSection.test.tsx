import { describe, expect, it, vi, beforeEach } from 'vitest'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import '@/i18n/config'
import PrintDevicesSection from './PrintDevicesSection'
import { printingAPI } from '@/lib/api'

vi.mock('@/lib/api', () => ({
  printingAPI: {
    status: vi.fn(),
    test: vi.fn(),
  },
}))

describe('PrintDevicesSection', () => {
  beforeEach(() => {
    vi.mocked(printingAPI.status).mockResolvedValue({
      fiscalPrinterEnabled: false,
      thermalPrinterEnabled: false,
      fiscalMode: 'mock',
      thermalMode: 'mock',
    })
    vi.mocked(printingAPI.test).mockReset()
  })

  it('shows opt-in hint when no device is enabled', async () => {
    render(<PrintDevicesSection />)

    await waitFor(() => {
      expect(screen.getByTestId('print-devices-opt-in-hint')).toBeInTheDocument()
    })
    expect(screen.queryByTestId('btn-print-test-thermal')).not.toBeInTheDocument()
    expect(screen.queryByTestId('btn-print-test-fiscal')).not.toBeInTheDocument()
  })

  it('loads status and runs thermal mock test when enabled', async () => {
    vi.mocked(printingAPI.status).mockResolvedValue({
      fiscalPrinterEnabled: false,
      thermalPrinterEnabled: true,
      fiscalMode: 'mock',
      thermalMode: 'mock',
    })
    vi.mocked(printingAPI.test).mockResolvedValue({
      device: 'thermal',
      channel: 'thermal_mock',
      fallbackToPdf: false,
      jobId: 'job-test-1',
    })

    render(<PrintDevicesSection />)

    await waitFor(() => {
      expect(screen.getByTestId('print-devices-section')).toBeInTheDocument()
    })

    fireEvent.click(screen.getByTestId('btn-print-test-thermal'))

    await waitFor(() => {
      expect(printingAPI.test).toHaveBeenCalledWith('thermal')
      expect(screen.getByTestId('print-devices-feedback')).toHaveTextContent('job-test-1')
    })
  })
})
