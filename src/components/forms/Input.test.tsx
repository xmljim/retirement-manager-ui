import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { createRef } from 'react'
import { Input } from './Input'

describe('Input', () => {
  it('renders with label', () => {
    render(<Input label="First Name" />)

    expect(screen.getByLabelText('First Name')).toBeInTheDocument()
  })

  it('renders with required indicator', () => {
    render(<Input label="First Name" required />)

    expect(screen.getByText('*')).toBeInTheDocument()
  })

  it('renders with hint text', () => {
    render(<Input label="First Name" hint="Enter your legal first name" />)

    expect(screen.getByText('Enter your legal first name')).toBeInTheDocument()
  })

  it('renders with error message', () => {
    render(<Input label="First Name" error="First name is required" />)

    expect(screen.getByRole('alert')).toHaveTextContent('First name is required')
  })

  it('sets aria-invalid when error is provided', () => {
    render(<Input label="First Name" error="First name is required" />)

    expect(screen.getByLabelText(/First Name/)).toHaveAttribute('aria-invalid', 'true')
  })

  it('does not set aria-invalid when no error', () => {
    render(<Input label="First Name" />)

    expect(screen.getByLabelText('First Name')).not.toHaveAttribute('aria-invalid')
  })

  it('forwards ref to input element', () => {
    const ref = createRef<HTMLInputElement>()
    render(<Input label="First Name" ref={ref} />)

    expect(ref.current).toBeInstanceOf(HTMLInputElement)
  })

  it('handles onChange events', () => {
    const handleChange = vi.fn()
    render(<Input label="First Name" onChange={handleChange} />)

    fireEvent.change(screen.getByLabelText('First Name'), { target: { value: 'John' } })

    expect(handleChange).toHaveBeenCalled()
  })

  it('passes through HTML input attributes', () => {
    render(<Input label="First Name" placeholder="Enter name" maxLength={50} disabled />)

    const input = screen.getByLabelText('First Name')
    expect(input).toHaveAttribute('placeholder', 'Enter name')
    expect(input).toHaveAttribute('maxLength', '50')
    expect(input).toBeDisabled()
  })

  it('uses provided id when specified', () => {
    render(<Input label="First Name" id="custom-id" />)

    expect(screen.getByLabelText('First Name')).toHaveAttribute('id', 'custom-id')
  })

  it('generates unique id when not specified', () => {
    render(<Input label="First Name" />)

    const input = screen.getByLabelText('First Name')
    expect(input).toHaveAttribute('id')
    expect(input.id).toBeTruthy()
  })

  it('applies base styling classes', () => {
    render(<Input label="First Name" />)

    const input = screen.getByLabelText('First Name')
    expect(input).toHaveClass('w-full', 'border', 'border-stone-300', 'rounded-[10px]')
  })

  it('applies error styling when error is provided', () => {
    render(<Input label="First Name" error="Required" />)

    const input = screen.getByLabelText(/First Name/)
    expect(input).toHaveClass('border-rose-500')
  })

  it('supports different input types', () => {
    render(<Input label="Email" type="email" />)

    expect(screen.getByLabelText('Email')).toHaveAttribute('type', 'email')
  })
})
