import { useState, useEffect, useRef } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { employmentApi, employerApi, queryKeys } from '../../api'
import type { ApiCreateEmploymentRequest, ApiEmploymentType, ApiEmployer } from '../../api'
import { Input, Select, DatePicker } from '../../components/forms'
import { EmployerForm } from './EmployerForm'

interface FormErrors {
  employerId?: string
  startDate?: string
  endDate?: string
  employmentType?: string
}

interface AddEmploymentFormProps {
  personId: string
  onClose: () => void
  onSuccess: () => void
}

const employmentTypeOptions = [
  { value: 'FULL_TIME', label: 'Full-Time' },
  { value: 'PART_TIME', label: 'Part-Time' },
  { value: 'CONTRACT', label: 'Contract' },
  { value: 'SELF_EMPLOYED', label: 'Self-Employed' },
]

export function AddEmploymentForm({ personId, onClose, onSuccess }: AddEmploymentFormProps) {
  const [employerId, setEmployerId] = useState('')
  const [jobTitle, setJobTitle] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [employmentType, setEmploymentType] = useState<ApiEmploymentType>('FULL_TIME')
  const [retirementPlanEligible, setRetirementPlanEligible] = useState(true)
  const [isCurrent, setIsCurrent] = useState(true)
  const [errors, setErrors] = useState<FormErrors>({})
  const [showEmployerForm, setShowEmployerForm] = useState(false)

  const dialogRef = useRef<HTMLDivElement>(null)
  const queryClient = useQueryClient()

  // Fetch employers for dropdown
  const { data: employersPage } = useQuery({
    queryKey: queryKeys.employers.all,
    queryFn: () => employerApi.getAll({ size: 100 }),
  })

  const employers = employersPage?.content ?? []

  const employerOptions = [
    { value: '', label: 'Select Employer' },
    ...employers.map(e => ({ value: e.id, label: e.name })),
  ]

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !showEmployerForm) {
        onClose()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [onClose, showEmployerForm])

  const handleIsCurrentChange = (checked: boolean) => {
    setIsCurrent(checked)
    if (checked) {
      setEndDate('')
    }
  }

  const createMutation = useMutation({
    mutationFn: (data: ApiCreateEmploymentRequest) => employmentApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.employment.byPerson(personId) })
      onSuccess()
    },
  })

  const validate = (): boolean => {
    const newErrors: FormErrors = {}

    if (!employerId) {
      newErrors.employerId = 'Please select an employer'
    }

    if (!startDate) {
      newErrors.startDate = 'Start date is required'
    }

    if (!isCurrent && !endDate) {
      newErrors.endDate = 'End date is required for past employment'
    }

    if (startDate && endDate) {
      const start = new Date(startDate)
      const end = new Date(endDate)
      if (end < start) {
        newErrors.endDate = 'End date must be after start date'
      }
    }

    if (startDate) {
      const start = new Date(startDate)
      if (start > new Date()) {
        newErrors.startDate = 'Start date cannot be in the future'
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

    const data: ApiCreateEmploymentRequest = {
      personId,
      employerId,
      startDate,
      employmentType,
      retirementPlanEligible,
    }

    if (jobTitle.trim()) {
      data.jobTitle = jobTitle.trim()
    }

    if (!isCurrent && endDate) {
      data.endDate = endDate
    }

    createMutation.mutate(data)
  }

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  const handleEmployerCreated = (newEmployer: ApiEmployer) => {
    setShowEmployerForm(false)
    setEmployerId(newEmployer.id)
    queryClient.invalidateQueries({ queryKey: queryKeys.employers.all })
  }

  return (
    <>
      <div
        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
        onClick={handleBackdropClick}
        role="dialog"
        aria-modal="true"
        aria-labelledby="add-employment-title"
      >
        <div
          ref={dialogRef}
          className="bg-white rounded-2xl p-6 max-w-lg w-full shadow-xl max-h-[90vh] overflow-y-auto"
          onClick={e => e.stopPropagation()}
        >
          <div className="flex justify-between items-center mb-6">
            <h2 id="add-employment-title" className="font-[--font-display] text-xl">
              Add Employment
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
              <div>
                <Select
                  label="Employer"
                  required
                  value={employerId}
                  onChange={e => setEmployerId(e.target.value)}
                  options={employerOptions}
                  error={errors.employerId}
                />
                <button
                  type="button"
                  onClick={() => setShowEmployerForm(true)}
                  className="mt-1 text-sm text-teal-600 hover:text-teal-700"
                >
                  + Add New Employer
                </button>
              </div>

              <Input
                label="Job Title"
                value={jobTitle}
                onChange={e => setJobTitle(e.target.value)}
                placeholder="Software Engineer"
              />

              <Select
                label="Employment Type"
                required
                value={employmentType}
                onChange={e => setEmploymentType(e.target.value as ApiEmploymentType)}
                options={employmentTypeOptions}
              />

              <DatePicker
                label="Start Date"
                required
                value={startDate}
                onChange={e => setStartDate(e.target.value)}
                error={errors.startDate}
                max={new Date().toISOString().split('T')[0]}
              />

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isCurrent"
                  checked={isCurrent}
                  onChange={e => handleIsCurrentChange(e.target.checked)}
                  className="w-4 h-4 text-teal-600 rounded border-stone-300 focus:ring-teal-500"
                />
                <label htmlFor="isCurrent" className="text-sm text-stone-700">
                  I currently work here
                </label>
              </div>

              {!isCurrent && (
                <DatePicker
                  label="End Date"
                  required
                  value={endDate}
                  onChange={e => setEndDate(e.target.value)}
                  error={errors.endDate}
                  min={startDate}
                  max={new Date().toISOString().split('T')[0]}
                />
              )}

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="retirementPlanEligible"
                  checked={retirementPlanEligible}
                  onChange={e => setRetirementPlanEligible(e.target.checked)}
                  className="w-4 h-4 text-teal-600 rounded border-stone-300 focus:ring-teal-500"
                />
                <label htmlFor="retirementPlanEligible" className="text-sm text-stone-700">
                  Eligible for employer retirement plan (401k, etc.)
                </label>
              </div>
            </div>

            {createMutation.error && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg" role="alert">
                <p className="text-sm text-red-800">Failed to add employment. Please try again.</p>
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
                {createMutation.isPending ? 'Saving...' : 'Save Employment'}
              </button>
            </div>
          </form>
        </div>
      </div>

      {showEmployerForm && (
        <EmployerForm
          onClose={() => setShowEmployerForm(false)}
          onSuccess={handleEmployerCreated}
        />
      )}
    </>
  )
}
