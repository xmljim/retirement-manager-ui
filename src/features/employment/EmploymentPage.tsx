import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router'
import { personApi, queryKeys } from '../../api'
import { EmploymentList } from './EmploymentList'

function LoadingState() {
  return (
    <div className="page" role="status" aria-label="Loading">
      <div className="flex items-center justify-center py-12">
        <div className="text-stone-500">Loading...</div>
      </div>
    </div>
  )
}

function ErrorState() {
  return (
    <div className="page" role="alert">
      <h1 className="font-[--font-display] text-3xl mb-6">Employment</h1>
      <div className="bg-red-50 border border-red-200 rounded-2xl p-8 text-center">
        <p className="text-red-800 mb-4">Failed to load profile. Please try again later.</p>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          Retry
        </button>
      </div>
    </div>
  )
}

function NoProfileState() {
  return (
    <div className="page">
      <h1 className="font-[--font-display] text-3xl mb-6">Employment</h1>
      <div className="bg-white rounded-2xl p-8 shadow-sm text-center">
        <p className="text-stone-500 mb-4">Please create a profile first to track employment.</p>
        <Link
          to="/profile/edit"
          className="inline-flex items-center gap-2 px-6 py-3 bg-teal-600 text-white rounded-lg font-semibold hover:bg-teal-700 transition-colors"
        >
          Create Profile
        </Link>
      </div>
    </div>
  )
}

export function EmploymentPage() {
  const {
    data: personsPage,
    isLoading,
    error,
  } = useQuery({
    queryKey: queryKeys.persons.all,
    queryFn: () => personApi.getAll({ page: 0, size: 1 }),
  })

  const person = personsPage?.content?.[0]

  if (isLoading) {
    return <LoadingState />
  }

  if (error) {
    return <ErrorState />
  }

  if (!person) {
    return <NoProfileState />
  }

  return (
    <div className="page">
      <header className="mb-8">
        <h1 className="font-[--font-display] text-[2rem] font-semibold">Employment</h1>
        <p className="text-stone-500 mt-2">
          Track your employment history and income for retirement planning.
        </p>
      </header>

      {/* Info box */}
      <div className="bg-stone-50 rounded-xl p-4 mb-6 flex gap-3">
        <span
          className="text-xl flex-shrink-0 w-6 h-6 rounded-full bg-teal-100 text-teal-600 flex items-center justify-center text-sm font-semibold"
          aria-hidden="true"
        >
          i
        </span>
        <p className="text-sm text-stone-700 leading-relaxed">
          <strong>Why track employment?</strong> Your employment history helps us calculate
          retirement plan eligibility, employer matching contributions, and income-based phase-outs
          for IRA deductions.
        </p>
      </div>

      {/* Employment List */}
      <section className="bg-white rounded-2xl p-6 shadow-sm">
        <EmploymentList personId={person.id} />
      </section>
    </div>
  )
}
