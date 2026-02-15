import { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { employmentApi, queryKeys } from '../../api'
import type { ApiEmployment } from '../../api'
import { AddEmploymentForm } from './AddEmploymentForm'

/**
 * Format a date string (YYYY-MM-DD) into a readable format (Mon YYYY)
 */
function formatMonthYear(dateString: string): string {
  const date = new Date(dateString + 'T00:00:00')
  return date.toLocaleDateString('en-US', {
    month: 'short',
    year: 'numeric',
  })
}

/**
 * Calculate duration between two dates
 */
function calculateDuration(
  startDate: string,
  endDate: string | undefined
): { years: number; months: number } {
  const start = new Date(startDate + 'T00:00:00')
  const end = endDate ? new Date(endDate + 'T00:00:00') : new Date()

  let years = end.getFullYear() - start.getFullYear()
  let months = end.getMonth() - start.getMonth()

  if (months < 0) {
    years--
    months += 12
  }

  if (end.getDate() < start.getDate()) {
    months--
    if (months < 0) {
      years--
      months += 12
    }
  }

  return { years, months }
}

/**
 * Format duration for display
 */
function formatDuration(years: number, months: number): string {
  if (years === 0 && months === 0) {
    return 'Less than a month'
  }
  const yearStr = years === 1 ? 'year' : 'years'
  const monthStr = months === 1 ? 'month' : 'months'
  if (years === 0) {
    return `${months} ${monthStr}`
  }
  if (months === 0) {
    return `${years} ${yearStr}`
  }
  return `${years} ${yearStr}, ${months} ${monthStr}`
}

/**
 * Format employment type for display
 */
function formatEmploymentType(type: ApiEmployment['employmentType']): string {
  const typeMap: Record<ApiEmployment['employmentType'], string> = {
    FULL_TIME: 'Full-Time',
    PART_TIME: 'Part-Time',
    CONTRACT: 'Contract',
    SELF_EMPLOYED: 'Self-Employed',
  }
  return typeMap[type]
}

interface EmploymentItemProps {
  employment: ApiEmployment
}

function EmploymentItem({ employment }: EmploymentItemProps) {
  const { years, months } = calculateDuration(employment.startDate, employment.endDate)
  const startFormatted = formatMonthYear(employment.startDate)
  const endFormatted = employment.endDate ? formatMonthYear(employment.endDate) : 'Present'
  const datesDisplay = `${startFormatted} - ${endFormatted}`

  return (
    <article className="border border-stone-200 rounded-xl p-5 mb-4 last:mb-0">
      <div className="flex justify-between items-start mb-2">
        <div>
          <h3 className="font-semibold text-lg">{employment.employerName}</h3>
          {employment.jobTitle && <p className="text-stone-600 text-sm">{employment.jobTitle}</p>}
        </div>
        <div className="flex gap-2">
          {employment.current && (
            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600">
              Current
            </span>
          )}
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-stone-100 text-stone-600">
            {formatEmploymentType(employment.employmentType)}
          </span>
        </div>
      </div>

      <div className="flex flex-wrap gap-4 text-sm text-stone-500 mt-3">
        <span>{datesDisplay}</span>
        <span>{formatDuration(years, months)}</span>
        {employment.retirementPlanEligible && (
          <span className="inline-flex items-center gap-1 text-teal-600">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
            401(k) Eligible
          </span>
        )}
      </div>
    </article>
  )
}

function EmptyState({ onAddClick }: { onAddClick: () => void }) {
  return (
    <div className="text-center py-12 text-stone-500">
      <div className="text-5xl mb-4 opacity-50" aria-hidden="true">
        &#128188;
      </div>
      <p className="mb-4">No employment history recorded yet.</p>
      <button
        onClick={onAddClick}
        className="px-4 py-2 bg-teal-600 text-white rounded-lg font-medium hover:bg-teal-700 transition-colors"
      >
        Add Your First Job
      </button>
    </div>
  )
}

function LoadingState() {
  return (
    <div className="py-12 text-center" role="status" aria-label="Loading employment history">
      <p className="text-stone-500">Loading employment history...</p>
    </div>
  )
}

function ErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center" role="alert">
      <p className="text-red-800 mb-4">Failed to load employment history. Please try again.</p>
      <button
        onClick={onRetry}
        className="px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors"
      >
        Retry
      </button>
    </div>
  )
}

interface EmploymentListProps {
  personId: string
}

export function EmploymentList({ personId }: EmploymentListProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const queryClient = useQueryClient()

  const {
    data: employments,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: queryKeys.employment.byPerson(personId),
    queryFn: () => employmentApi.getByPersonId(personId),
    enabled: !!personId,
  })

  const handleSuccess = () => {
    setIsModalOpen(false)
    queryClient.invalidateQueries({ queryKey: queryKeys.employment.byPerson(personId) })
  }

  if (isLoading) {
    return <LoadingState />
  }

  if (error) {
    return <ErrorState onRetry={() => refetch()} />
  }

  // Sort employments: current first, then by start date descending
  const sortedEmployments = [...(employments ?? [])].sort((a, b) => {
    if (a.current && !b.current) return -1
    if (!a.current && b.current) return 1
    return new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
  })

  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <h2 className="font-[--font-display] text-xl">Employment History</h2>
        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2.5 bg-teal-600 text-white rounded-lg font-medium hover:bg-teal-700 transition-colors text-sm"
        >
          + Add Employment
        </button>
      </div>

      {sortedEmployments.length > 0 ? (
        <div role="list" aria-label="Employment history">
          {sortedEmployments.map(employment => (
            <div key={employment.id} role="listitem">
              <EmploymentItem employment={employment} />
            </div>
          ))}
        </div>
      ) : (
        <EmptyState onAddClick={() => setIsModalOpen(true)} />
      )}

      {isModalOpen && (
        <AddEmploymentForm
          personId={personId}
          onClose={() => setIsModalOpen(false)}
          onSuccess={handleSuccess}
        />
      )}
    </>
  )
}
