import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { Dashboard } from './Dashboard'

function renderDashboard() {
  return render(
    <MemoryRouter>
      <Dashboard />
    </MemoryRouter>
  )
}

describe('Dashboard', () => {
  it('renders the greeting', () => {
    renderDashboard()

    expect(screen.getByText(/Good morning/)).toBeInTheDocument()
  })

  it('renders stat cards', () => {
    renderDashboard()

    expect(screen.getByText('Total Portfolio')).toBeInTheDocument()
    expect(screen.getByText('YTD Contributions')).toBeInTheDocument()
    expect(screen.getByText('Employer Match')).toBeInTheDocument()
    expect(screen.getByText('Remaining Room')).toBeInTheDocument()
  })

  it('renders the accounts section', () => {
    renderDashboard()

    expect(screen.getByText('Your Accounts')).toBeInTheDocument()
    expect(screen.getByText('View All')).toBeInTheDocument()
  })

  it('renders quick actions', () => {
    renderDashboard()

    expect(screen.getByText('Quick Actions')).toBeInTheDocument()
    expect(screen.getByText('Set Up Profile')).toBeInTheDocument()
    expect(screen.getByText('View Limits')).toBeInTheDocument()
    expect(screen.getByText('Add Account')).toBeInTheDocument()
  })
})
