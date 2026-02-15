import { useState, useEffect, useRef, useCallback } from 'react'
import { useMutation } from '@tanstack/react-query'
import { marriageApi } from '../../api'
import type { ApiCreateMarriageRequest, ApiMarriageStatus } from '../../api'
import { Input, Select, DatePicker } from '../../components/forms'

interface FormErrors {
  spouseFirstName?: string
  spouseLastName?: string
  marriageDate?: string
  endDate?: string
  status?: string
}

interface AddMarriageFormProps {
  personId: string
  onClose: () => void
  onSuccess: () => void
}

const statusOptions = [
  { value: 'MARRIED', label: 'Married' },
  { value: 'DIVORCED', label: 'Divorced' },
  { value: 'WIDOWED', label: 'Widowed' },
  { value: 'ANNULLED', label: 'Annulled' },
]

export function AddMarriageForm({ personId, onClose, onSuccess }: AddMarriageFormProps) {
  const [spouseFirstName, setSpouseFirstName] = useState('')
  const [spouseLastName, setSpouseLastName] = useState('')
  const [marriageDate, setMarriageDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [status, setStatus] = useState<ApiMarriageStatus>('MARRIED')
  const [errors, setErrors] = useState<FormErrors>({})

  const dialogRef = useRef<HTMLDivElement>(null)
  const firstInputRef = useRef<HTMLInputElement>(null)

  // Focus trap and escape key handling
  useEffect(() => {
    // Focus first input on mount
    firstInputRef.current?.focus()

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }

      // Focus trap
      if (e.key === 'Tab' && dialogRef.current) {
        const focusableElements = dialogRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        )
        const firstElement = focusableElements[0]
        const lastElement = focusableElements[focusableElements.length - 1]

        if (e.shiftKey && document.activeElement === firstElement) {
          e.preventDefault()
          lastElement?.focus()
        } else if (!e.shiftKey && document.activeElement === lastElement) {
          e.preventDefault()
          firstElement?.focus()
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  // Handle status change - clear end date when switching to MARRIED
  const handleStatusChange = useCallback((newStatus: ApiMarriageStatus) => {
    setStatus(newStatus)
    if (newStatus === 'MARRIED') {
      setEndDate('')
    }
  }, [])

  const createMutation = useMutation({
    mutationFn: (data: ApiCreateMarriageRequest) => marriageApi.create(personId, data),
    onSuccess: () => {
      onSuccess()
    },
  })

  const validate = (): boolean => {
    const newErrors: FormErrors = {}

    if (!spouseFirstName.trim()) {
      newErrors.spouseFirstName = 'First name is required'
    }

    if (!spouseLastName.trim()) {
      newErrors.spouseLastName = 'Last name is required'
    }

    if (!marriageDate) {
      newErrors.marriageDate = 'Marriage date is required'
    }

    // End date validation for non-married status
    if (status !== 'MARRIED' && !endDate) {
      newErrors.endDate = 'End date is required for this status'
    }

    // End date must be after marriage date
    if (marriageDate && endDate) {
      const start = new Date(marriageDate)
      const end = new Date(endDate)
      if (end < start) {
        newErrors.endDate = 'End date must be after marriage date'
      }
    }

    // Marriage date cannot be in the future
    if (marriageDate) {
      const start = new Date(marriageDate)
      if (start > new Date()) {
        newErrors.marriageDate = 'Marriage date cannot be in the future'
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!validate()) {
      return
    }

    const data: ApiCreateMarriageRequest = {
      spouseFirstName: spouseFirstName.trim(),
      spouseLastName: spouseLastName.trim(),
      marriageDate,
      status,
    }

    // Only include endDate if provided
    if (endDate) {
      data.endDate = endDate
    }

    createMutation.mutate(data)
  }

  const handleBackdropClick = (e: React.MouseEvent) => {
    // Only close if clicking the backdrop, not the dialog content
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  const showEndDate = status !== 'MARRIED'

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="add-marriage-title"
    >
      <div
        ref={dialogRef}
        className="bg-white rounded-2xl p-6 max-w-md w-full shadow-xl"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-6">
          <h2 id="add-marriage-title" className="font-[--font-display] text-xl">
            Add Marriage
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
              label="Spouse First Name"
              required
              value={spouseFirstName}
              onChange={e => setSpouseFirstName(e.target.value)}
              error={errors.spouseFirstName}
              autoComplete="off"
            />

            <Input
              label="Spouse Last Name"
              required
              value={spouseLastName}
              onChange={e => setSpouseLastName(e.target.value)}
              error={errors.spouseLastName}
              autoComplete="off"
            />

            <DatePicker
              label="Marriage Date"
              required
              value={marriageDate}
              onChange={e => setMarriageDate(e.target.value)}
              error={errors.marriageDate}
              max={new Date().toISOString().split('T')[0]}
            />

            <Select
              label="Status"
              required
              value={status}
              onChange={e => handleStatusChange(e.target.value as ApiMarriageStatus)}
              options={statusOptions}
              error={errors.status}
            />

            {showEndDate && (
              <DatePicker
                label="End Date"
                required
                value={endDate}
                onChange={e => setEndDate(e.target.value)}
                error={errors.endDate}
                min={marriageDate}
                max={new Date().toISOString().split('T')[0]}
              />
            )}
          </div>

          {createMutation.error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg" role="alert">
              <p className="text-sm text-red-800">Failed to add marriage. Please try again.</p>
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
              disabled={createMutation.isPending}
              className="flex-1 px-4 py-3 bg-teal-600 text-white rounded-lg font-medium hover:bg-teal-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {createMutation.isPending ? 'Saving...' : 'Save Marriage'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
