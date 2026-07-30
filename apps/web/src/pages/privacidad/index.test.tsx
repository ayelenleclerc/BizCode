import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import PrivacyPage from './index'

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}))

vi.mock('@/components/LanguageSelect', () => ({
  default: () => <div data-testid="language-select" />,
}))

describe('PrivacyPage', () => {
  it('renders public privacy sections and login link', () => {
    render(
      <MemoryRouter>
        <PrivacyPage />
      </MemoryRouter>,
    )
    expect(screen.getByTestId('privacy-page')).toBeInTheDocument()
    expect(screen.getByTestId('privacy-title')).toHaveTextContent('title')
    expect(screen.getByTestId('privacy-back-login')).toHaveAttribute('href', '/login')
    expect(screen.getByText('rightsAccess')).toBeInTheDocument()
    expect(screen.getByText('aaipBody')).toBeInTheDocument()
  })
})
