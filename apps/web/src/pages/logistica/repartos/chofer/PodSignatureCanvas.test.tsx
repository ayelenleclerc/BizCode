import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import '@/i18n/config'
import PodSignatureCanvas from './PodSignatureCanvas'

describe('PodSignatureCanvas', () => {
  it('renders canvas and clear button', () => {
    const onChange = vi.fn()
    render(<PodSignatureCanvas onChange={onChange} />)
    expect(screen.getByTestId('pod-signature-canvas')).toBeInTheDocument()
    expect(screen.getByTestId('pod-signature-clear')).toBeInTheDocument()
  })
})
