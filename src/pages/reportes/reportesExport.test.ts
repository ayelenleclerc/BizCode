import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest'
import { downloadCsvBlob } from './reportesExport'

describe('downloadCsvBlob', () => {
  const createObjectURL = vi.fn(() => 'blob:mock')
  const revokeObjectURL = vi.fn()

  beforeEach(() => {
    vi.stubGlobal('URL', {
      createObjectURL,
      revokeObjectURL,
    })
    vi.spyOn(document, 'createElement').mockImplementation(() => {
      const anchor = {
        href: '',
        download: '',
        click: vi.fn(),
      } as unknown as HTMLAnchorElement
      return anchor
    })
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    vi.restoreAllMocks()
  })

  it('crea enlace temporal y revoca la URL', () => {
    const blob = new Blob(['a,b'], { type: 'text/csv' })
    downloadCsvBlob(blob, 'reporte.csv')
    expect(createObjectURL).toHaveBeenCalledWith(blob)
    expect(revokeObjectURL).toHaveBeenCalledWith('blob:mock')
  })
})
