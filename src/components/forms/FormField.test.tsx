import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { FormField } from './FormField'

describe('FormField', () => {
  it('renders label text', () => {
    render(
      <FormField label="Email Address">
        <input type="email" />
      </FormField>
    )

    expect(screen.getByText('Email Address')).toBeInTheDocument()
  })

  it('renders required indicator when required is true', () => {
    render(
      <FormField label="Email Address" required>
        <input type="email" />
      </FormField>
    )

    expect(screen.getByText('*')).toBeInTheDocument()
    expect(screen.getByText('*')).toHaveClass('text-rose-500')
  })

  it('does not render required indicator when required is false', () => {
    render(
      <FormField label="Email Address">
        <input type="email" />
      </FormField>
    )

    expect(screen.queryByText('*')).not.toBeInTheDocument()
  })

  it('renders hint text', () => {
    render(
      <FormField label="Email Address" hint="We will never share your email">
        <input type="email" />
      </FormField>
    )

    expect(screen.getByText('We will never share your email')).toBeInTheDocument()
  })

  it('renders error message instead of hint when error is provided', () => {
    render(
      <FormField
        label="Email Address"
        hint="We will never share your email"
        error="Invalid email format"
      >
        <input type="email" />
      </FormField>
    )

    expect(screen.getByText('Invalid email format')).toBeInTheDocument()
    expect(screen.queryByText('We will never share your email')).not.toBeInTheDocument()
  })

  it('renders error with role="alert" for accessibility', () => {
    render(
      <FormField label="Email Address" error="Invalid email format">
        <input type="email" />
      </FormField>
    )

    expect(screen.getByRole('alert')).toHaveTextContent('Invalid email format')
  })

  it('renders children', () => {
    render(
      <FormField label="Email Address">
        <input type="email" data-testid="email-input" />
      </FormField>
    )

    expect(screen.getByTestId('email-input')).toBeInTheDocument()
  })

  it('applies custom className to wrapper', () => {
    const { container } = render(
      <FormField label="Email Address" className="custom-class">
        <input type="email" />
      </FormField>
    )

    expect(container.firstChild).toHaveClass('custom-class')
  })

  it('associates label with htmlFor', () => {
    render(
      <FormField label="Email Address" htmlFor="email-field">
        <input type="email" id="email-field" />
      </FormField>
    )

    const label = screen.getByText('Email Address')
    expect(label).toHaveAttribute('for', 'email-field')
  })
})
