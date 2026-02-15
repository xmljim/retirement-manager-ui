import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { PersonForm } from './PersonForm'

function renderPersonForm() {
  return render(
    <MemoryRouter>
      <PersonForm />
    </MemoryRouter>
  )
}

describe('PersonForm', () => {
  it('renders the page title', () => {
    renderPersonForm()

    expect(screen.getByRole('heading', { name: 'Edit Profile' })).toBeInTheDocument()
  })

  it('renders back link', () => {
    renderPersonForm()

    expect(screen.getByRole('link', { name: /Back/ })).toHaveAttribute('href', '/profile')
  })

  it('renders form fields', () => {
    renderPersonForm()

    expect(screen.getByLabelText(/First Name/)).toBeInTheDocument()
    expect(screen.getByLabelText(/Last Name/)).toBeInTheDocument()
    expect(screen.getByLabelText(/Date of Birth/)).toBeInTheDocument()
    expect(screen.getByLabelText(/Filing Status/)).toBeInTheDocument()
    expect(screen.getByLabelText(/State/)).toBeInTheDocument()
  })

  it('renders filing status options', () => {
    renderPersonForm()

    const select = screen.getByLabelText(/Filing Status/)
    expect(select).toBeInTheDocument()
    expect(screen.getByRole('option', { name: 'Single' })).toBeInTheDocument()
    expect(screen.getByRole('option', { name: 'Married Filing Jointly' })).toBeInTheDocument()
  })

  it('renders submit and cancel buttons', () => {
    renderPersonForm()

    expect(screen.getByRole('button', { name: 'Save Profile' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Cancel' })).toHaveAttribute('href', '/profile')
  })
})
