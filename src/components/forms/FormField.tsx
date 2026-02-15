import { type ReactNode } from 'react'

export interface FormFieldProps {
  /** Label text for the field */
  label: string
  /** Whether the field is required */
  required?: boolean
  /** Hint text displayed below the input */
  hint?: string
  /** Error message to display */
  error?: string
  /** The form control(s) to render */
  children: ReactNode
  /** Additional class names for the wrapper */
  className?: string
  /** HTML id for the label's htmlFor attribute */
  htmlFor?: string
}

export function FormField({
  label,
  required = false,
  hint,
  error,
  children,
  className = '',
  htmlFor,
}: FormFieldProps) {
  return (
    <div className={`${className}`}>
      <label htmlFor={htmlFor} className="block font-medium text-sm mb-1.5 text-stone-700">
        {label}
        {required && <span className="text-rose-500 ml-1">*</span>}
      </label>
      {children}
      {hint && !error && <p className="text-xs text-stone-500 mt-1">{hint}</p>}
      {error && (
        <p className="text-xs text-rose-500 mt-1" role="alert">
          {error}
        </p>
      )}
    </div>
  )
}
