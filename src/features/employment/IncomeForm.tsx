import { useState, useEffect, useRef } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { employmentIncomeApi, queryKeys } from '../../api'
import type { ApiCreateEmploymentIncomeRequest, ApiEmploymentIncome } from '../../api'
import { Input } from '../../components/forms'

interface FormErrors {
  year?: string
  annualSalary?: string
  bonus?: string
  otherCompensation?: string
  w2Wages?: string
}

interface IncomeFormProps {
  employmentId: string
  personId: string
  income?: ApiEmploymentIncome
  onClose: () => void
  onSuccess: () => void
}

export function IncomeForm({
  employmentId,
  personId,
  income,
  onClose,
  onSuccess,
}: IncomeFormProps) {
  const currentYear = new Date().getFullYear()

  const [year, setYear] = useState(income?.year?.toString() ?? currentYear.toString())
  const [annualSalary, setAnnualSalary] = useState(income?.annualSalary?.toString() ?? '')
  const [bonus, setBonus] = useState(income?.bonus?.toString() ?? '0')
  const [otherCompensation, setOtherCompensation] = useState(
    income?.otherCompensation?.toString() ?? '0'
  )
  const [w2Wages, setW2Wages] = useState(income?.w2Wages?.toString() ?? '')
  const [errors, setErrors] = useState<FormErrors>({})

  const dialogRef = useRef<HTMLDivElement>(null)
  const firstInputRef = useRef<HTMLInputElement>(null)
  const queryClient = useQueryClient()

  const isEditing = !!income

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
    mutationFn: (data: ApiCreateEmploymentIncomeRequest) => employmentIncomeApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.employmentIncome.byEmployment(employmentId),
      })
      queryClient.invalidateQueries({ queryKey: queryKeys.employmentIncome.byPerson(personId) })
      onSuccess()
    },
  })

  const updateMutation = useMutation({
    mutationFn: (data: {
      annualSalary: number
      bonus: number
      otherCompensation: number
      w2Wages?: number
    }) => employmentIncomeApi.update(income!.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.employmentIncome.byEmployment(employmentId),
      })
      queryClient.invalidateQueries({ queryKey: queryKeys.employmentIncome.byPerson(personId) })
      onSuccess()
    },
  })

  const mutation = isEditing ? updateMutation : createMutation

  const validate = (): boolean => {
    const newErrors: FormErrors = {}

    const yearNum = parseInt(year, 10)
    if (isNaN(yearNum) || yearNum < 1900 || yearNum > 2100) {
      newErrors.year = 'Please enter a valid year (1900-2100)'
    }

    const salaryNum = parseFloat(annualSalary)
    if (isNaN(salaryNum) || salaryNum < 0) {
      newErrors.annualSalary = 'Please enter a valid salary amount'
    }

    const bonusNum = parseFloat(bonus)
    if (bonus && (isNaN(bonusNum) || bonusNum < 0)) {
      newErrors.bonus = 'Please enter a valid bonus amount'
    }

    const otherNum = parseFloat(otherCompensation)
    if (otherCompensation && (isNaN(otherNum) || otherNum < 0)) {
      newErrors.otherCompensation = 'Please enter a valid amount'
    }

    if (w2Wages) {
      const w2Num = parseFloat(w2Wages)
      if (isNaN(w2Num) || w2Num < 0) {
        newErrors.w2Wages = 'Please enter a valid W-2 wages amount'
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

    if (isEditing) {
      updateMutation.mutate({
        annualSalary: parseFloat(annualSalary),
        bonus: parseFloat(bonus) || 0,
        otherCompensation: parseFloat(otherCompensation) || 0,
        w2Wages: w2Wages ? parseFloat(w2Wages) : undefined,
      })
    } else {
      const data: ApiCreateEmploymentIncomeRequest = {
        employmentId,
        year: parseInt(year, 10),
        annualSalary: parseFloat(annualSalary),
      }

      if (bonus) data.bonus = parseFloat(bonus)
      if (otherCompensation) data.otherCompensation = parseFloat(otherCompensation)
      if (w2Wages) data.w2Wages = parseFloat(w2Wages)

      createMutation.mutate(data)
    }
  }

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  const formatCurrency = (value: string) => {
    const num = value.replace(/[^\d.]/g, '')
    return num
  }

  const totalCompensation =
    (parseFloat(annualSalary) || 0) +
    (parseFloat(bonus) || 0) +
    (parseFloat(otherCompensation) || 0)

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="income-form-title"
    >
      <div
        ref={dialogRef}
        className="bg-white rounded-2xl p-6 max-w-lg w-full shadow-xl max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-6">
          <h2 id="income-form-title" className="font-[--font-display] text-xl">
            {isEditing ? 'Edit Income' : 'Add Income'}
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
              label="Tax Year"
              required
              type="number"
              value={year}
              onChange={e => setYear(e.target.value)}
              error={errors.year}
              min={1900}
              max={2100}
              disabled={isEditing}
            />

            <Input
              label="Annual Salary"
              required
              type="number"
              value={annualSalary}
              onChange={e => setAnnualSalary(formatCurrency(e.target.value))}
              error={errors.annualSalary}
              placeholder="120000"
              min={0}
              step="0.01"
            />

            <Input
              label="Bonus"
              type="number"
              value={bonus}
              onChange={e => setBonus(formatCurrency(e.target.value))}
              error={errors.bonus}
              placeholder="15000"
              min={0}
              step="0.01"
            />

            <Input
              label="Other Compensation"
              type="number"
              value={otherCompensation}
              onChange={e => setOtherCompensation(formatCurrency(e.target.value))}
              error={errors.otherCompensation}
              placeholder="5000"
              min={0}
              step="0.01"
            />

            <div className="bg-stone-50 rounded-lg p-4">
              <div className="flex justify-between items-center">
                <span className="text-stone-600">Total Compensation</span>
                <span className="font-semibold text-lg">
                  ${totalCompensation.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>

            <div className="border-t pt-4">
              <Input
                label="W-2 Wages (for SECURE 2.0)"
                type="number"
                value={w2Wages}
                onChange={e => setW2Wages(formatCurrency(e.target.value))}
                error={errors.w2Wages}
                placeholder="140000"
                min={0}
                step="0.01"
              />
              <p className="text-xs text-stone-500 mt-1">
                Required for high-earner catch-up contribution rules. Leave blank if unsure.
              </p>
            </div>
          </div>

          {mutation.error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg" role="alert">
              <p className="text-sm text-red-800">
                Failed to {isEditing ? 'update' : 'add'} income. Please try again.
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
              {mutation.isPending ? 'Saving...' : isEditing ? 'Update Income' : 'Save Income'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
