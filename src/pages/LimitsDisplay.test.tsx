import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { LimitsDisplay } from './LimitsDisplay'

describe('LimitsDisplay', () => {
  it('renders the page title', () => {
    render(<LimitsDisplay />)

    expect(screen.getByRole('heading', { name: '2025 Contribution Limits' })).toBeInTheDocument()
  })

  it('renders the table headers', () => {
    render(<LimitsDisplay />)

    expect(screen.getByText('Account Type')).toBeInTheDocument()
    expect(screen.getByText('Under 50')).toBeInTheDocument()
    expect(screen.getByText('50 and Over')).toBeInTheDocument()
  })

  it('renders 401k limits', () => {
    render(<LimitsDisplay />)

    expect(screen.getByText('401(k) Employee Contribution')).toBeInTheDocument()
    expect(screen.getByText('401(k) Total Limit')).toBeInTheDocument()
  })

  it('renders IRA limits', () => {
    render(<LimitsDisplay />)

    expect(screen.getByText('IRA Contribution')).toBeInTheDocument()
  })

  it('renders HSA limits', () => {
    render(<LimitsDisplay />)

    expect(screen.getByText('HSA Individual')).toBeInTheDocument()
    expect(screen.getByText('HSA Family')).toBeInTheDocument()
  })

  it('renders the note about catch-up contributions', () => {
    render(<LimitsDisplay />)

    expect(screen.getByText(/Catch-up contributions/)).toBeInTheDocument()
  })
})
