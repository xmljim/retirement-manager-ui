import { useState, useEffect, useRef } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { employerApi, queryKeys } from '../../api'
import type { ApiCreateEmployerRequest, ApiEmployer } from '../../api'
import { Input, Select } from '../../components/forms'

interface FormErrors {
  name?: string
  ein?: string
  state?: string
  zipCode?: string
}

interface EmployerFormProps {
  employer?: ApiEmployer
  onClose: () => void
  onSuccess: (employer: ApiEmployer) => void
}

const stateOptions = [
  { value: '', label: 'Select State' },
  { value: 'AL', label: 'Alabama' },
  { value: 'AK', label: 'Alaska' },
  { value: 'AZ', label: 'Arizona' },
  { value: 'AR', label: 'Arkansas' },
  { value: 'CA', label: 'California' },
  { value: 'CO', label: 'Colorado' },
  { value: 'CT', label: 'Connecticut' },
  { value: 'DE', label: 'Delaware' },
  { value: 'FL', label: 'Florida' },
  { value: 'GA', label: 'Georgia' },
  { value: 'HI', label: 'Hawaii' },
  { value: 'ID', label: 'Idaho' },
  { value: 'IL', label: 'Illinois' },
  { value: 'IN', label: 'Indiana' },
  { value: 'IA', label: 'Iowa' },
  { value: 'KS', label: 'Kansas' },
  { value: 'KY', label: 'Kentucky' },
  { value: 'LA', label: 'Louisiana' },
  { value: 'ME', label: 'Maine' },
  { value: 'MD', label: 'Maryland' },
  { value: 'MA', label: 'Massachusetts' },
  { value: 'MI', label: 'Michigan' },
  { value: 'MN', label: 'Minnesota' },
  { value: 'MS', label: 'Mississippi' },
  { value: 'MO', label: 'Missouri' },
  { value: 'MT', label: 'Montana' },
  { value: 'NE', label: 'Nebraska' },
  { value: 'NV', label: 'Nevada' },
  { value: 'NH', label: 'New Hampshire' },
  { value: 'NJ', label: 'New Jersey' },
  { value: 'NM', label: 'New Mexico' },
  { value: 'NY', label: 'New York' },
  { value: 'NC', label: 'North Carolina' },
  { value: 'ND', label: 'North Dakota' },
  { value: 'OH', label: 'Ohio' },
  { value: 'OK', label: 'Oklahoma' },
  { value: 'OR', label: 'Oregon' },
  { value: 'PA', label: 'Pennsylvania' },
  { value: 'RI', label: 'Rhode Island' },
  { value: 'SC', label: 'South Carolina' },
  { value: 'SD', label: 'South Dakota' },
  { value: 'TN', label: 'Tennessee' },
  { value: 'TX', label: 'Texas' },
  { value: 'UT', label: 'Utah' },
  { value: 'VT', label: 'Vermont' },
  { value: 'VA', label: 'Virginia' },
  { value: 'WA', label: 'Washington' },
  { value: 'WV', label: 'West Virginia' },
  { value: 'WI', label: 'Wisconsin' },
  { value: 'WY', label: 'Wyoming' },
]

export function EmployerForm({ employer, onClose, onSuccess }: EmployerFormProps) {
  const [name, setName] = useState(employer?.name ?? '')
  const [ein, setEin] = useState(employer?.ein ?? '')
  const [addressLine1, setAddressLine1] = useState(employer?.addressLine1 ?? '')
  const [addressLine2, setAddressLine2] = useState(employer?.addressLine2 ?? '')
  const [city, setCity] = useState(employer?.city ?? '')
  const [state, setState] = useState(employer?.state ?? '')
  const [zipCode, setZipCode] = useState(employer?.zipCode ?? '')
  const [errors, setErrors] = useState<FormErrors>({})

  const dialogRef = useRef<HTMLDivElement>(null)
  const firstInputRef = useRef<HTMLInputElement>(null)
  const queryClient = useQueryClient()

  const isEditing = !!employer

  useEffect(() => {
    firstInputRef.current?.focus()

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  const createMutation = useMutation({
    mutationFn: (data: ApiCreateEmployerRequest) => employerApi.create(data),
    onSuccess: result => {
      queryClient.invalidateQueries({ queryKey: queryKeys.employers.all })
      onSuccess(result)
    },
  })

  const updateMutation = useMutation({
    mutationFn: (data: ApiCreateEmployerRequest) => employerApi.update(employer!.id, data),
    onSuccess: result => {
      queryClient.invalidateQueries({ queryKey: queryKeys.employers.all })
      queryClient.invalidateQueries({ queryKey: queryKeys.employers.detail(employer!.id) })
      onSuccess(result)
    },
  })

  const mutation = isEditing ? updateMutation : createMutation

  const validate = (): boolean => {
    const newErrors: FormErrors = {}

    if (!name.trim()) {
      newErrors.name = 'Employer name is required'
    }

    if (ein && !/^\d{2}-\d{7}$/.test(ein)) {
      newErrors.ein = 'EIN must be in XX-XXXXXXX format'
    }

    if (state && !/^[A-Z]{2}$/.test(state)) {
      newErrors.state = 'Invalid state code'
    }

    if (zipCode && !/^\d{5}(-\d{4})?$/.test(zipCode)) {
      newErrors.zipCode = 'ZIP code must be XXXXX or XXXXX-XXXX'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!validate()) {
      return
    }

    const data: ApiCreateEmployerRequest = {
      name: name.trim(),
    }

    if (ein) data.ein = ein
    if (addressLine1) data.addressLine1 = addressLine1.trim()
    if (addressLine2) data.addressLine2 = addressLine2.trim()
    if (city) data.city = city.trim()
    if (state) data.state = state
    if (zipCode) data.zipCode = zipCode

    mutation.mutate(data)
  }

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  const formatEin = (value: string) => {
    const digits = value.replace(/\D/g, '').slice(0, 9)
    if (digits.length > 2) {
      return `${digits.slice(0, 2)}-${digits.slice(2)}`
    }
    return digits
  }

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="employer-form-title"
    >
      <div
        ref={dialogRef}
        className="bg-white rounded-2xl p-6 max-w-lg w-full shadow-xl max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-6">
          <h2 id="employer-form-title" className="font-[--font-display] text-xl">
            {isEditing ? 'Edit Employer' : 'Add Employer'}
          </h2>
          <button
            onClick={onClose}
            className="text-stone-500 hover:text-stone-700 transition-colors p-1"
            aria-label="Close dialog"
            type="button"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          <div className="space-y-4">
            <Input
              ref={firstInputRef}
              label="Employer Name"
              required
              value={name}
              onChange={e => setName(e.target.value)}
              error={errors.name}
              placeholder="Acme Corporation"
            />

            <Input
              label="EIN"
              value={ein}
              onChange={e => setEin(formatEin(e.target.value))}
              error={errors.ein}
              placeholder="XX-XXXXXXX"
              maxLength={10}
            />

            <Input
              label="Address Line 1"
              value={addressLine1}
              onChange={e => setAddressLine1(e.target.value)}
              placeholder="123 Main Street"
            />

            <Input
              label="Address Line 2"
              value={addressLine2}
              onChange={e => setAddressLine2(e.target.value)}
              placeholder="Suite 100"
            />

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="City"
                value={city}
                onChange={e => setCity(e.target.value)}
                placeholder="San Francisco"
              />

              <Select
                label="State"
                value={state}
                onChange={e => setState(e.target.value)}
                options={stateOptions}
                error={errors.state}
              />
            </div>

            <Input
              label="ZIP Code"
              value={zipCode}
              onChange={e => setZipCode(e.target.value)}
              error={errors.zipCode}
              placeholder="94102"
              maxLength={10}
            />
          </div>

          {mutation.error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg" role="alert">
              <p className="text-sm text-red-800">
                Failed to {isEditing ? 'update' : 'add'} employer. Please try again.
              </p>
            </div>
          )}

          <div className="flex gap-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 bg-white border border-stone-300 text-stone-700 rounded-lg font-medium hover:bg-stone-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={mutation.isPending}
              className="flex-1 px-4 py-3 bg-teal-600 text-white rounded-lg font-medium hover:bg-teal-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {mutation.isPending ? 'Saving...' : isEditing ? 'Update Employer' : 'Add Employer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
