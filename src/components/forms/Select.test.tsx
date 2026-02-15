import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { createRef } from 'react'
import { Select } from './Select'

const filingStatusOptions = [
  { value: 'SINGLE', label: 'Single' },
  { value: 'MFJ', label: 'Married Filing Jointly' },
  { value: 'MFS', label: 'Married Filing Separately' },
  { value: 'HOH', label: 'Head of Household' },
]

describe('Select', () => {
  it('renders with label', () => {
    render(<Select label="Filing Status" options={filingStatusOptions} />)

    expect(screen.getByLabelText('Filing Status')).toBeInTheDocument()
  })

  it('renders with required indicator', () => {
    render(<Select label="Filing Status" required options={filingStatusOptions} />)

    expect(screen.getByText('*')).toBeInTheDocument()
  })

  it('renders with hint text', () => {
    render(
      <Select
        label="Filing Status"
        hint="Choose your tax filing status"
        options={filingStatusOptions}
      />
    )

    expect(screen.getByText('Choose your tax filing status')).toBeInTheDocument()
  })

  it('renders with error message', () => {
    render(
      <Select
        label="Filing Status"
        error="Filing status is required"
        options={filingStatusOptions}
      />
    )

    expect(screen.getByRole('alert')).toHaveTextContent('Filing status is required')
  })

  it('sets aria-invalid when error is provided', () => {
    render(<Select label="Filing Status" error="Required" options={filingStatusOptions} />)

    expect(screen.getByLabelText(/Filing Status/)).toHaveAttribute('aria-invalid', 'true')
  })

  it('renders options from options prop', () => {
    render(<Select label="Filing Status" options={filingStatusOptions} />)

    expect(screen.getByRole('option', { name: 'Single' })).toBeInTheDocument()
    expect(screen.getByRole('option', { name: 'Married Filing Jointly' })).toBeInTheDocument()
    expect(screen.getByRole('option', { name: 'Married Filing Separately' })).toBeInTheDocument()
    expect(screen.getByRole('option', { name: 'Head of Household' })).toBeInTheDocument()
  })

  it('renders placeholder option when provided', () => {
    render(
      <Select label="Filing Status" placeholder="Select status..." options={filingStatusOptions} />
    )

    const placeholder = screen.getByRole('option', { name: 'Select status...' })
    expect(placeholder).toBeInTheDocument()
    expect(placeholder).toBeDisabled()
  })

  it('renders children as options', () => {
    render(
      <Select label="State">
        <option value="CA">California</option>
        <option value="TX">Texas</option>
      </Select>
    )

    expect(screen.getByRole('option', { name: 'California' })).toBeInTheDocument()
    expect(screen.getByRole('option', { name: 'Texas' })).toBeInTheDocument()
  })

  it('forwards ref to select element', () => {
    const ref = createRef<HTMLSelectElement>()
    render(<Select label="Filing Status" ref={ref} options={filingStatusOptions} />)

    expect(ref.current).toBeInstanceOf(HTMLSelectElement)
  })

  it('handles onChange events', () => {
    const handleChange = vi.fn()
    render(<Select label="Filing Status" onChange={handleChange} options={filingStatusOptions} />)

    fireEvent.change(screen.getByLabelText('Filing Status'), { target: { value: 'SINGLE' } })

    expect(handleChange).toHaveBeenCalled()
  })

  it('passes through HTML select attributes', () => {
    render(<Select label="Filing Status" disabled options={filingStatusOptions} />)

    expect(screen.getByLabelText('Filing Status')).toBeDisabled()
  })

  it('uses provided id when specified', () => {
    render(<Select label="Filing Status" id="custom-select-id" options={filingStatusOptions} />)

    expect(screen.getByLabelText('Filing Status')).toHaveAttribute('id', 'custom-select-id')
  })

  it('generates unique id when not specified', () => {
    render(<Select label="Filing Status" options={filingStatusOptions} />)

    const select = screen.getByLabelText('Filing Status')
    expect(select).toHaveAttribute('id')
    expect(select.id).toBeTruthy()
  })

  it('applies base styling classes', () => {
    render(<Select label="Filing Status" options={filingStatusOptions} />)

    const select = screen.getByLabelText('Filing Status')
    expect(select).toHaveClass('w-full', 'border', 'border-stone-300', 'rounded-[10px]')
  })

  it('applies error styling when error is provided', () => {
    render(<Select label="Filing Status" error="Required" options={filingStatusOptions} />)

    const select = screen.getByLabelText(/Filing Status/)
    expect(select).toHaveClass('border-rose-500')
  })
})
