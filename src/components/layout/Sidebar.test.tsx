import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { Sidebar } from './Sidebar'

function renderSidebar() {
  return render(
    <MemoryRouter>
      <Sidebar />
    </MemoryRouter>
  )
}

describe('Sidebar', () => {
  it('renders the logo', () => {
    renderSidebar()

    expect(screen.getByText('RetireWise')).toBeInTheDocument()
  })

  it('renders main navigation items', () => {
    renderSidebar()

    expect(screen.getByText('Dashboard')).toBeInTheDocument()
    expect(screen.getByText('Profile')).toBeInTheDocument()
    expect(screen.getByText('Accounts')).toBeInTheDocument()
  })

  it('renders planning section header', () => {
    renderSidebar()

    expect(screen.getByText('Planning')).toBeInTheDocument()
  })

  it('renders planning navigation items', () => {
    renderSidebar()

    expect(screen.getByText('Contributions')).toBeInTheDocument()
    expect(screen.getByText('Limits')).toBeInTheDocument()
    expect(screen.getByText('Projections')).toBeInTheDocument()
  })

  it('renders navigation links with correct hrefs', () => {
    renderSidebar()

    expect(screen.getByRole('link', { name: /Dashboard/ })).toHaveAttribute('href', '/')
    expect(screen.getByRole('link', { name: /Profile/ })).toHaveAttribute('href', '/profile')
    expect(screen.getByRole('link', { name: /Limits/ })).toHaveAttribute('href', '/limits')
  })
})
