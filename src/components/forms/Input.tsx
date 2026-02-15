import { forwardRef, useId, type InputHTMLAttributes } from 'react'
import { FormField, type FormFieldProps } from './FormField'

export interface InputProps
  extends
    Omit<InputHTMLAttributes<HTMLInputElement>, 'className'>,
    Omit<FormFieldProps, 'children' | 'htmlFor'> {
  /** Additional class names for the input element */
  inputClassName?: string
}

const baseInputClasses =
  'w-full px-4 py-3.5 border border-stone-300 rounded-[10px] text-base font-[--font-body] bg-white transition-all'
const focusClasses =
  'focus:outline-none focus:border-teal-500 focus:ring-[3px] focus:ring-teal-500/15'
const errorClasses = 'border-rose-500 focus:border-rose-500 focus:ring-rose-500/15'
const disabledClasses = 'disabled:bg-stone-100 disabled:text-stone-500 disabled:cursor-not-allowed'

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, required, hint, error, className, inputClassName = '', ...inputProps },
  ref
) {
  const generatedId = useId()
  const inputId = inputProps.id ?? generatedId

  return (
    <FormField
      label={label}
      required={required}
      hint={hint}
      error={error}
      className={className}
      htmlFor={inputId}
    >
      <input
        ref={ref}
        id={inputId}
        aria-invalid={error ? 'true' : undefined}
        aria-describedby={hint || error ? `${inputId}-description` : undefined}
        className={`${baseInputClasses} ${focusClasses} ${error ? errorClasses : ''} ${disabledClasses} ${inputClassName}`}
        {...inputProps}
      />
    </FormField>
  )
})
