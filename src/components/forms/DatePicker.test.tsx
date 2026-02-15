import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { createRef } from 'react'
import { DatePicker } from './DatePicker'

describe('DatePicker', () => {
  it('renders with label', () => {
    render(<DatePicker label="Date of Birth" />)

    expect(screen.getByLabelText('Date of Birth')).toBeInTheDocument()
  })

  it('renders as type="date" input', () => {
    render(<DatePicker label="Date of Birth" />)

    expect(screen.getByLabelText('Date of Birth')).toHaveAttribute('type', 'date')
  })

  it('renders with required indicator', () => {
    render(<DatePicker label="Date of Birth" required />)

    expect(screen.getByText('*')).toBeInTheDocument()
  })

  it('renders with hint text', () => {
    render(<DatePicker label="Date of Birth" hint="Used to calculate catch-up eligibility" />)

    expect(screen.getByText('Used to calculate catch-up eligibility')).toBeInTheDocument()
  })

  it('renders with error message', () => {
    render(<DatePicker label="Date of Birth" error="Date of birth is required" />)

    expect(screen.getByRole('alert')).toHaveTextContent('Date of birth is required')
  })

  it('sets aria-invalid when error is provided', () => {
    render(<DatePicker label="Date of Birth" error="Required" />)

    expect(screen.getByLabelText(/Date of Birth/)).toHaveAttribute('aria-invalid', 'true')
  })

  it('does not set aria-invalid when no error', () => {
    render(<DatePicker label="Date of Birth" />)

    expect(screen.getByLabelText('Date of Birth')).not.toHaveAttribute('aria-invalid')
  })

  it('forwards ref to input element', () => {
    const ref = createRef<HTMLInputElement>()
    render(<DatePicker label="Date of Birth" ref={ref} />)

    expect(ref.current).toBeInstanceOf(HTMLInputElement)
  })

  it('handles onChange events', () => {
    const handleChange = vi.fn()
    render(<DatePicker label="Date of Birth" onChange={handleChange} />)

    fireEvent.change(screen.getByLabelText('Date of Birth'), { target: { value: '1990-01-15' } })

    expect(handleChange).toHaveBeenCalled()
  })

  it('passes through HTML input attributes', () => {
    render(<DatePicker label="Date of Birth" min="1900-01-01" max="2024-12-31" disabled />)

    const input = screen.getByLabelText('Date of Birth')
    expect(input).toHaveAttribute('min', '1900-01-01')
    expect(input).toHaveAttribute('max', '2024-12-31')
    expect(input).toBeDisabled()
  })

  it('uses provided id when specified', () => {
    render(<DatePicker label="Date of Birth" id="dob-input" />)

    expect(screen.getByLabelText('Date of Birth')).toHaveAttribute('id', 'dob-input')
  })

  it('generates unique id when not specified', () => {
    render(<DatePicker label="Date of Birth" />)

    const input = screen.getByLabelText('Date of Birth')
    expect(input).toHaveAttribute('id')
    expect(input.id).toBeTruthy()
  })

  it('applies base styling classes', () => {
    render(<DatePicker label="Date of Birth" />)

    const input = screen.getByLabelText('Date of Birth')
    expect(input).toHaveClass('w-full', 'border', 'border-stone-300', 'rounded-[10px]')
  })

  it('applies error styling when error is provided', () => {
    render(<DatePicker label="Date of Birth" error="Required" />)

    const input = screen.getByLabelText(/Date of Birth/)
    expect(input).toHaveClass('border-rose-500')
  })

  it('accepts value prop for controlled input', () => {
    render(<DatePicker label="Date of Birth" value="1990-05-20" onChange={() => {}} />)

    expect(screen.getByLabelText('Date of Birth')).toHaveValue('1990-05-20')
  })

  it('accepts defaultValue prop for uncontrolled input', () => {
    render(<DatePicker label="Date of Birth" defaultValue="1985-03-10" />)

    expect(screen.getByLabelText('Date of Birth')).toHaveValue('1985-03-10')
  })
})
