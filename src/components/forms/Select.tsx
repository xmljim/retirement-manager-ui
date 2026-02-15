import { forwardRef, useId, type SelectHTMLAttributes, type ReactNode } from 'react'
import { FormField, type FormFieldProps } from './FormField'

export interface SelectOption {
  value: string
  label: string
}

export interface SelectProps
  extends
    Omit<SelectHTMLAttributes<HTMLSelectElement>, 'className'>,
    Omit<FormFieldProps, 'children' | 'htmlFor'> {
  /** Array of options or ReactNode children */
  options?: SelectOption[]
  /** Placeholder option text */
  placeholder?: string
  /** Additional class names for the select element */
  selectClassName?: string
  /** Option elements as children (alternative to options prop) */
  children?: ReactNode
}

const baseSelectClasses =
  'w-full px-4 py-3.5 border border-stone-300 rounded-[10px] text-base font-[--font-body] bg-white transition-all appearance-none cursor-pointer'
const focusClasses =
  'focus:outline-none focus:border-teal-500 focus:ring-[3px] focus:ring-teal-500/15'
const errorClasses = 'border-rose-500 focus:border-rose-500 focus:ring-rose-500/15'
const disabledClasses = 'disabled:bg-stone-100 disabled:text-stone-500 disabled:cursor-not-allowed'

// Custom dropdown arrow using background image
const arrowClasses =
  "bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%2378716c%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C%2Fpolyline%3E%3C%2Fsvg%3E')] bg-no-repeat bg-[right_12px_center] pr-10"

export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  {
    label,
    required,
    hint,
    error,
    className,
    selectClassName = '',
    options,
    placeholder,
    children,
    ...selectProps
  },
  ref
) {
  const generatedId = useId()
  const selectId = selectProps.id ?? generatedId

  return (
    <FormField
      label={label}
      required={required}
      hint={hint}
      error={error}
      className={className}
      htmlFor={selectId}
    >
      <select
        ref={ref}
        id={selectId}
        aria-invalid={error ? 'true' : undefined}
        aria-describedby={hint || error ? `${selectId}-description` : undefined}
        className={`${baseSelectClasses} ${focusClasses} ${arrowClasses} ${error ? errorClasses : ''} ${disabledClasses} ${selectClassName}`}
        {...selectProps}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options?.map(option => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
        {children}
      </select>
    </FormField>
  )
})
