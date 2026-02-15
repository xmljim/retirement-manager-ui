import { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { marriageApi, personApi, queryKeys } from '../../api'
import type { ApiMarriage } from '../../api'
import { AddMarriageForm } from './AddMarriageForm'

/**
 * Social Security spousal benefit threshold in years
 */
const SS_ELIGIBILITY_YEARS = 10

/**
 * Calculate the duration between two dates in years and months
 */
function calculateDuration(
  startDate: string,
  endDate: string | undefined
): { years: number; months: number; totalMonths: number } {
  const start = new Date(startDate + 'T00:00:00')
  const end = endDate ? new Date(endDate + 'T00:00:00') : new Date()

  let years = end.getFullYear() - start.getFullYear()
  let months = end.getMonth() - start.getMonth()

  if (months < 0) {
    years--
    months += 12
  }

  // Adjust for day of month
  if (end.getDate() < start.getDate()) {
    months--
    if (months < 0) {
      years--
      months += 12
    }
  }

  const totalMonths = years * 12 + months
  return { years, months, totalMonths }
}

/**
 * Format duration for display
 */
function formatDuration(years: number, months: number): string {
  const yearStr = years === 1 ? 'year' : 'years'
  const monthStr = months === 1 ? 'month' : 'months'
  return `${years} ${yearStr}, ${months} ${monthStr}`
}

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
 * Get the badge styles based on marriage status
 */
function getStatusBadgeStyles(status: ApiMarriage['status']): string {
  const baseClasses =
    'inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold'

  switch (status) {
    case 'MARRIED':
      return `${baseClasses} bg-emerald-500/10 text-emerald-500`
    case 'DIVORCED':
      return `${baseClasses} bg-amber-500/10 text-amber-500`
    case 'WIDOWED':
      return `${baseClasses} bg-stone-100 text-stone-500`
    case 'ANNULLED':
      return `${baseClasses} bg-rose-500/10 text-rose-500`
    default:
      return `${baseClasses} bg-stone-100 text-stone-500`
  }
}

/**
 * Format marriage status for display
 */
function formatStatus(status: ApiMarriage['status']): string {
  const statusMap: Record<ApiMarriage['status'], string> = {
    MARRIED: 'Married',
    DIVORCED: 'Divorced',
    WIDOWED: 'Widowed',
    ANNULLED: 'Annulled',
  }
  return statusMap[status]
}

interface MarriageItemProps {
  marriage: ApiMarriage
}

function MarriageItem({ marriage }: MarriageItemProps) {
  const { years, months, totalMonths } = calculateDuration(marriage.marriageDate, marriage.endDate)

  // Calculate progress toward 10-year SS eligibility threshold
  const thresholdMonths = SS_ELIGIBILITY_YEARS * 12
  const progressPercent = Math.min((totalMonths / thresholdMonths) * 100, 100)
  const isEligible = totalMonths >= thresholdMonths

  // Determine the dates display
  const startFormatted = formatMonthYear(marriage.marriageDate)
  const endFormatted = marriage.endDate ? formatMonthYear(marriage.endDate) : 'Present'
  const datesDisplay = `${startFormatted} - ${endFormatted}`

  return (
    <article className="border border-stone-200 rounded-xl p-5 mb-4 last:mb-0">
      {/* Header with spouse name and status badge */}
      <div className="flex justify-between items-start mb-3">
        <div>
          <h3 className="font-semibold text-lg">
            {marriage.spouseFirstName} {marriage.spouseLastName}
          </h3>
          <p className="text-sm text-stone-500 mt-1">{datesDisplay}</p>
        </div>
        <span className={getStatusBadgeStyles(marriage.status)}>
          {formatStatus(marriage.status)}
        </span>
      </div>

      {/* Meta info: duration and eligibility */}
      <div className="flex gap-6 text-sm text-stone-500">
        <span className="flex items-center gap-1.5">{formatDuration(years, months)}</span>
        <span>
          {isEligible ? (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-500">
              SS Eligible
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-stone-100 text-stone-500">
              Not SS Eligible
            </span>
          )}
        </span>
      </div>

      {/* Duration progress bar */}
      <div
        className="h-1.5 bg-stone-200 rounded-full mt-4 overflow-hidden"
        role="progressbar"
        aria-valuenow={Math.round(progressPercent)}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`Marriage duration: ${formatDuration(years, months)}, ${isEligible ? 'eligible' : 'not eligible'} for Social Security spousal benefits`}
      >
        <div
          className={`h-full rounded-full transition-all ${isEligible ? 'bg-emerald-500' : 'bg-amber-500'}`}
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* Duration labels */}
      <div className="flex justify-between text-xs text-stone-500 mt-1.5">
        <span>0 years</span>
        <span>10 year threshold</span>
        <span>{marriage.endDate ? '' : 'Current'}</span>
      </div>
    </article>
  )
}

function EmptyState({ onAddClick }: { onAddClick: () => void }) {
  return (
    <div className="text-center py-12 text-stone-500">
      <div className="text-5xl mb-4 opacity-50" aria-hidden="true">
        &#128141;
      </div>
      <p className="mb-4">No marriage history recorded yet.</p>
      <button
        onClick={onAddClick}
        className="px-4 py-2 bg-teal-600 text-white rounded-lg font-medium hover:bg-teal-700 transition-colors"
      >
        Add Your First Marriage
      </button>
    </div>
  )
}

function LoadingState() {
  return (
    <div className="py-12 text-center" role="status" aria-label="Loading marriage history">
      <p className="text-stone-500">Loading marriage history...</p>
    </div>
  )
}

function ErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center" role="alert">
      <p className="text-red-800 mb-4">Failed to load marriage history. Please try again.</p>
      <button
        onClick={onRetry}
        className="px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors"
      >
        Retry
      </button>
    </div>
  )
}

export function MarriageHistory() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const queryClient = useQueryClient()

  // Fetch the current person
  const {
    data: persons,
    isLoading: isLoadingPersons,
    error: personsError,
  } = useQuery({
    queryKey: queryKeys.persons.all,
    queryFn: personApi.getAll,
  })

  const person = persons?.[0]

  // Fetch marriages for the person
  const {
    data: marriages,
    isLoading: isLoadingMarriages,
    error: marriagesError,
    refetch,
  } = useQuery({
    queryKey: queryKeys.marriages.byPerson(person?.id ?? ''),
    queryFn: () => marriageApi.getByPersonId(person!.id),
    enabled: !!person?.id,
  })

  const isLoading = isLoadingPersons || isLoadingMarriages
  const hasError = personsError || marriagesError

  const handleSuccess = () => {
    setIsModalOpen(false)
    // Invalidate marriages query to refresh the list
    if (person?.id) {
      queryClient.invalidateQueries({ queryKey: queryKeys.marriages.byPerson(person.id) })
    }
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl p-6 shadow-sm max-w-[700px] mx-auto">
        <LoadingState />
      </div>
    )
  }

  // Error state
  if (hasError) {
    return (
      <div className="bg-white rounded-2xl p-6 shadow-sm max-w-[700px] mx-auto">
        <ErrorState onRetry={() => refetch()} />
      </div>
    )
  }

  // No person profile exists
  if (!person) {
    return (
      <div className="bg-white rounded-2xl p-6 shadow-sm max-w-[700px] mx-auto">
        <h2 className="font-[--font-display] text-xl mb-4">Marriage History</h2>
        <p className="text-stone-500 text-center py-8">
          Please create a profile first to add marriage history.
        </p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm max-w-[700px] mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="font-[--font-display] text-xl">Marriage History</h2>
        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2.5 bg-teal-600 text-white rounded-lg font-medium hover:bg-teal-700 transition-colors text-sm"
        >
          + Add Marriage
        </button>
      </div>

      {/* Info box explaining SS benefits */}
      <div className="bg-stone-50 rounded-xl p-4 mb-6 flex gap-3">
        <span
          className="text-xl flex-shrink-0 w-6 h-6 rounded-full bg-teal-100 text-teal-600 flex items-center justify-center text-sm font-semibold"
          aria-hidden="true"
        >
          i
        </span>
        <p className="text-sm text-stone-700 leading-relaxed">
          <strong>Why track this?</strong> Social Security spousal benefits require marriages of 10+
          years for divorced spouse benefits. We track this to help calculate your potential
          benefits.
        </p>
      </div>

      {/* Marriage list or empty state */}
      {marriages && marriages.length > 0 ? (
        <div role="list" aria-label="Marriage history">
          {marriages.map(marriage => (
            <div key={marriage.id} role="listitem">
              <MarriageItem marriage={marriage} />
            </div>
          ))}
        </div>
      ) : (
        <EmptyState onAddClick={() => setIsModalOpen(true)} />
      )}

      {/* Add Marriage Modal */}
      {isModalOpen && (
        <AddMarriageForm
          personId={person.id}
          onClose={() => setIsModalOpen(false)}
          onSuccess={handleSuccess}
        />
      )}
    </div>
  )
}
