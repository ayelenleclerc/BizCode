import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import '@/i18n/config'
import AsyncWrapper from './AsyncWrapper'

describe('AsyncWrapper', () => {
  it('shows a loading spinner while loading', () => {
    render(
      <AsyncWrapper loading={true} error={null}>
        <p>content</p>
      </AsyncWrapper>,
    )

    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument()
    expect(screen.queryByText('content')).not.toBeInTheDocument()
  })

  it('shows an error message when loading failed', () => {
    render(
      <AsyncWrapper loading={false} error={new Error('boom')}>
        <p>content</p>
      </AsyncWrapper>,
    )

    expect(screen.getByTestId('async-wrapper-error')).toBeInTheDocument()
  })

  it('renders children on success', () => {
    render(
      <AsyncWrapper loading={false} error={null}>
        <p>content</p>
      </AsyncWrapper>,
    )

    expect(screen.getByText('content')).toBeInTheDocument()
  })
})
