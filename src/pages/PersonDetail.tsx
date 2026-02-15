import { Link } from 'react-router'
import { useQuery } from '@tanstack/react-query'
import { personApi, accountApi, limitsApi, queryKeys } from '../api'
import type { ApiPerson, ApiAccount, ApiContributionLimits } from '../api'

/**
 * Format a filing status enum value into a human-readable string
 */
function formatFilingStatus(status: ApiPerson['filingStatus']): string {
  const statusMap: Record<ApiPerson['filingStatus'], string> = {
    SINGLE: 'Single',
    MARRIED_FILING_JOINTLY: 'Married Filing Jointly',
    MARRIED_FILING_SEPARATELY: 'Married Filing Separately',
    HEAD_OF_HOUSEHOLD: 'Head of Household',
  }
  return statusMap[status]
}

/**
 * Format a date string (YYYY-MM-DD) into a readable format (Month Day, Year)
 */
function formatDate(dateString: string): string {
  const date = new Date(dateString + 'T00:00:00')
  return date.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })
}

/**
 * Calculate age from date of birth
 */
function calculateAge(dateOfBirth: string): number {
  const today = new Date()
  const birthDate = new Date(dateOfBirth + 'T00:00:00')
  let age = today.getFullYear() - birthDate.getFullYear()
  const monthDiff = today.getMonth() - birthDate.getMonth()
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--
  }
  return age
}

/**
 * Check if person is eligible for catch-up contributions (50+)
 */
function isCatchUpEligible(dateOfBirth: string): boolean {
  return calculateAge(dateOfBirth) >= 50
}

/**
 * Format currency value for display
 */
function formatCurrency(amount: number): string {
  if (amount >= 1000) {
    const formatted = (amount / 1000).toFixed(amount % 1000 === 0 ? 0 : 1)
    return `$${formatted}K`
  }
  return `$${amount.toLocaleString()}`
}

/**
 * Format currency value with full precision
 */
function formatFullCurrency(amount: number): string {
  return `$${amount.toLocaleString()}`
}

/**
 * Format account type enum into readable string
 */
function formatAccountType(accountType: ApiAccount['accountType']): string {
  const typeMap: Record<ApiAccount['accountType'], string> = {
    TRADITIONAL_401K: 'Traditional 401(k)',
    ROTH_401K: 'Roth 401(k)',
    TRADITIONAL_IRA: 'Traditional IRA',
    ROTH_IRA: 'Roth IRA',
    HSA: 'HSA',
    BROKERAGE: 'Brokerage',
    PENSION: 'Pension',
  }
  return typeMap[accountType]
}

/**
 * Get account description based on type and employer
 */
function getAccountDescription(account: ApiAccount): string {
  if (account.employerName) {
    return `Employer: ${account.employerName}`
  }
  if (account.accountType === 'HSA') {
    return 'High-Deductible Health Plan'
  }
  return 'Personal Account'
}

interface ContributionStat {
  value: string
  label: string
}

/**
 * Build contribution stats from limits data
 */
function buildContributionStats(
  limits: ApiContributionLimits | undefined,
  isCatchUp: boolean
): ContributionStat[] {
  if (!limits) {
    return [
      { value: '--', label: '401(k) Limit' },
      { value: '--', label: 'IRA Limit' },
      { value: '--', label: 'HSA Limit' },
    ]
  }

  const effective401kLimit = isCatchUp
    ? limits.traditional401kLimit + limits.catchUp401kLimit
    : limits.traditional401kLimit

  const effectiveIraLimit = isCatchUp
    ? limits.traditionalIraLimit + limits.catchUpIraLimit
    : limits.traditionalIraLimit

  const effectiveHsaLimit = isCatchUp
    ? limits.hsaIndividualLimit + limits.catchUpHsaLimit
    : limits.hsaIndividualLimit

  return [
    { value: formatCurrency(effective401kLimit), label: '401(k) Limit' },
    { value: formatCurrency(effectiveIraLimit), label: 'IRA Limit' },
    { value: formatCurrency(effectiveHsaLimit), label: 'HSA Limit' },
  ]
}

export function PersonDetail() {
  // Fetch persons list to get the current user's profile
  const {
    data: persons,
    isLoading: isLoadingPersons,
    error: personsError,
  } = useQuery({
    queryKey: queryKeys.persons.all,
    queryFn: personApi.getAll,
  })

  // Use the first person as the current profile
  const person = persons?.[0]

  // Fetch accounts for the person
  const { data: accounts, isLoading: isLoadingAccounts } = useQuery({
    queryKey: queryKeys.accounts.byPerson(person?.id ?? ''),
    queryFn: () => accountApi.getByPersonId(person!.id),
    enabled: !!person?.id,
  })

  // Fetch contribution limits for the person
  const { data: limits, isLoading: isLoadingLimits } = useQuery({
    queryKey: queryKeys.limits.byPerson(person?.id ?? ''),
    queryFn: () => limitsApi.getByPersonId(person!.id),
    enabled: !!person?.id,
  })

  // Loading state
  if (isLoadingPersons) {
    return (
      <div className="page" role="status" aria-label="Loading profile">
        <div className="flex items-center justify-center py-12">
          <div className="text-stone-500">Loading profile...</div>
        </div>
      </div>
    )
  }

  // Error state
  if (personsError) {
    return (
      <div className="page" role="alert">
        <h1 className="font-[--font-display] text-3xl mb-6">Profile</h1>
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

  // Empty state - no profile exists
  if (!person) {
    return (
      <div className="page">
        <h1 className="font-[--font-display] text-3xl mb-6">Profile</h1>
        <div className="bg-white rounded-2xl p-8 shadow-sm text-center">
          <p className="text-stone-500 mb-4">No profile set up yet.</p>
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

  const age = calculateAge(person.dateOfBirth)
  const catchUpEligible = isCatchUpEligible(person.dateOfBirth)
  const contributionStats = buildContributionStats(limits, catchUpEligible)
  const currentYear = new Date().getFullYear()

  return (
    <div className="page">
      {/* Header */}
      <header className="flex justify-between items-start mb-8">
        <div>
          <h1 className="font-[--font-display] text-[2rem] font-semibold">
            {person.firstName} {person.lastName}
          </h1>
          <div className="flex items-center gap-4 mt-2 text-stone-500 text-[0.9rem]">
            <span>Age {age}</span>
            {person.state && <span>{person.state}</span>}
            {catchUpEligible && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[0.8rem] font-medium bg-teal-500/10 text-teal-600">
                Catch-up Eligible
              </span>
            )}
          </div>
        </div>
        <Link
          to="/profile/edit"
          className="px-5 py-2.5 bg-white border border-stone-300 rounded-lg font-medium hover:bg-stone-50 transition-colors"
        >
          Edit Profile
        </Link>
      </header>

      {/* Content Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Personal Information Card */}
        <section
          className="bg-white rounded-2xl p-6 shadow-sm"
          aria-labelledby="personal-info-title"
        >
          <h2 id="personal-info-title" className="font-[--font-display] text-[1.1rem] mb-4">
            Personal Information
          </h2>

          <dl>
            <div className="flex justify-between py-3 border-b border-stone-100">
              <dt className="text-stone-500 text-[0.9rem]">Date of Birth</dt>
              <dd className="font-medium">{formatDate(person.dateOfBirth)}</dd>
            </div>
            <div className="flex justify-between py-3 border-b border-stone-100">
              <dt className="text-stone-500 text-[0.9rem]">Filing Status</dt>
              <dd className="font-medium">{formatFilingStatus(person.filingStatus)}</dd>
            </div>
            <div className="flex justify-between py-3 border-b border-stone-100">
              <dt className="text-stone-500 text-[0.9rem]">State</dt>
              <dd className="font-medium">{person.state || 'Not specified'}</dd>
            </div>
            <div className="flex justify-between py-3">
              <dt className="text-stone-500 text-[0.9rem]">Catch-up Status</dt>
              <dd>
                {catchUpEligible ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[0.8rem] font-medium bg-teal-500/10 text-teal-600">
                    50+ Eligible
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[0.8rem] font-medium bg-amber-500/10 text-amber-500">
                    Under 50
                  </span>
                )}
              </dd>
            </div>
          </dl>
        </section>

        {/* Contribution Room Card */}
        <section
          className="bg-white rounded-2xl p-6 shadow-sm"
          aria-labelledby="contribution-room-title"
        >
          <h2 id="contribution-room-title" className="font-[--font-display] text-[1.1rem] mb-4">
            {currentYear} Contribution Room
          </h2>

          {isLoadingLimits ? (
            <div className="text-center py-4 text-stone-500" role="status">
              Loading limits...
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-4">
              {contributionStats.map(stat => (
                <div key={stat.label} className="text-center p-4 bg-stone-50 rounded-xl">
                  <div className="font-[--font-display] text-2xl font-semibold text-teal-600">
                    {stat.value}
                  </div>
                  <div className="text-[0.8rem] text-stone-500 mt-1">{stat.label}</div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Accounts Card - Full Width */}
        <section
          className="bg-white rounded-2xl p-6 shadow-sm md:col-span-2"
          aria-labelledby="accounts-title"
        >
          <div className="flex justify-between items-center mb-4">
            <h2 id="accounts-title" className="font-[--font-display] text-[1.1rem]">
              Accounts
            </h2>
            <Link
              to="/accounts/new"
              className="px-3 py-1.5 bg-white border border-stone-300 rounded-lg text-[0.8rem] font-medium hover:bg-stone-50 transition-colors"
            >
              + Add Account
            </Link>
          </div>

          {isLoadingAccounts ? (
            <div className="text-center py-4 text-stone-500" role="status">
              Loading accounts...
            </div>
          ) : accounts && accounts.length > 0 ? (
            <ul className="space-y-3" role="list" aria-label="Account list">
              {accounts.map(account => (
                <li
                  key={account.id}
                  className="flex justify-between items-center p-4 bg-stone-50 rounded-xl"
                >
                  <div>
                    <div className="font-medium">
                      {account.accountName || formatAccountType(account.accountType)}
                    </div>
                    <div className="text-[0.8rem] text-stone-500">
                      {getAccountDescription(account)}
                    </div>
                  </div>
                  <div className="font-[--font-display] font-semibold text-emerald-500">
                    {formatFullCurrency(account.balance)}
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-center py-8 text-stone-500">
              <p>No accounts added yet.</p>
              <Link
                to="/accounts/new"
                className="inline-block mt-2 text-teal-600 hover:text-teal-700"
              >
                Add your first account
              </Link>
            </div>
          )}
        </section>
      </div>
    </div>
  )
}
