import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { PersonDetail } from './PersonDetail'
import * as api from '../api/client'

// Mock the API module
vi.mock('../api/client', async () => {
  const actual = await vi.importActual('../api/client')
  return {
    ...actual,
    personApi: {
      getAll: vi.fn(),
      getById: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
    accountApi: {
      getByPersonId: vi.fn(),
      create: vi.fn(),
    },
    limitsApi: {
      getByYear: vi.fn(),
      getByYearAndAccountType: vi.fn(),
      getAvailableYears: vi.fn(),
    },
  }
})

const mockPersonApi = api.personApi as {
  getAll: ReturnType<typeof vi.fn>
  getById: ReturnType<typeof vi.fn>
  create: ReturnType<typeof vi.fn>
  update: ReturnType<typeof vi.fn>
}

const mockAccountApi = api.accountApi as {
  getByPersonId: ReturnType<typeof vi.fn>
  create: ReturnType<typeof vi.fn>
}

const mockLimitsApi = api.limitsApi as {
  getByYear: ReturnType<typeof vi.fn>
  getByYearAndAccountType: ReturnType<typeof vi.fn>
  getAvailableYears: ReturnType<typeof vi.fn>
}

function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  })
}

function renderPersonDetail() {
  const queryClient = createQueryClient()
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        <PersonDetail />
      </MemoryRouter>
    </QueryClientProvider>
  )
}

const mockPerson = {
  id: '123',
  firstName: 'John',
  lastName: 'Smith',
  dateOfBirth: '1974-03-15',
  filingStatus: 'MARRIED_FILING_JOINTLY' as const,
  state: 'California',
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
}

const mockYoungPerson = {
  ...mockPerson,
  id: '456',
  dateOfBirth: '1990-06-20',
}

const mockAccounts = [
  {
    id: 'acc1',
    personId: '123',
    accountType: 'TRADITIONAL_401K' as const,
    accountName: null,
    balance: 245000,
    contributionYtd: 5000,
    employerName: 'Acme Corp',
    employerMatchPercent: 6,
    employerMatchLimitPercent: 50,
    vestingPercent: 100,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'acc2',
    personId: '123',
    accountType: 'ROTH_IRA' as const,
    accountName: 'My Roth IRA',
    balance: 68500,
    contributionYtd: 2000,
    vestingPercent: 100,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
]

const mockLimits = {
  year: 2025,
  contributionLimits: [
    { id: '1', year: 2025, accountType: 'TRADITIONAL_401K', limitType: 'BASE', amount: 23500 },
    { id: '2', year: 2025, accountType: 'TRADITIONAL_401K', limitType: 'CATCHUP_50', amount: 7500 },
    { id: '3', year: 2025, accountType: 'TRADITIONAL_IRA', limitType: 'BASE', amount: 7000 },
    { id: '4', year: 2025, accountType: 'TRADITIONAL_IRA', limitType: 'CATCHUP_50', amount: 1000 },
    { id: '5', year: 2025, accountType: 'HSA_SELF', limitType: 'BASE', amount: 4300 },
    { id: '6', year: 2025, accountType: 'HSA_SELF', limitType: 'CATCHUP_55', amount: 1000 },
  ],
  phaseOutRanges: [],
}

const mockPagePerson = {
  content: [mockPerson],
  totalElements: 1,
  totalPages: 1,
  size: 1,
  number: 0,
  first: true,
  last: true,
  empty: false,
}

const mockEmptyPagePerson = {
  content: [],
  totalElements: 0,
  totalPages: 0,
  size: 1,
  number: 0,
  first: true,
  last: true,
  empty: true,
}

describe('PersonDetail', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Loading state', () => {
    it('shows loading indicator while fetching data', () => {
      mockPersonApi.getAll.mockReturnValue(new Promise(() => {}))

      renderPersonDetail()

      expect(screen.getByRole('status', { name: /loading profile/i })).toBeInTheDocument()
      expect(screen.getByText('Loading profile...')).toBeInTheDocument()
    })
  })

  describe('Error state', () => {
    it('shows error message when API fails', async () => {
      mockPersonApi.getAll.mockRejectedValue(new Error('Network error'))

      renderPersonDetail()

      await waitFor(() => {
        expect(screen.getByRole('alert')).toBeInTheDocument()
      })
      expect(screen.getByText(/failed to load profile/i)).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /retry/i })).toBeInTheDocument()
    })
  })

  describe('Empty state', () => {
    it('shows empty state when no profile exists', async () => {
      mockPersonApi.getAll.mockResolvedValue(mockEmptyPagePerson)
      mockLimitsApi.getByYear.mockResolvedValue(mockLimits)

      renderPersonDetail()

      await waitFor(() => {
        expect(screen.getByText('No profile set up yet.')).toBeInTheDocument()
      })
      expect(screen.getByRole('link', { name: /create profile/i })).toHaveAttribute(
        'href',
        '/profile/edit'
      )
    })
  })

  describe('Profile display', () => {
    beforeEach(() => {
      mockPersonApi.getAll.mockResolvedValue(mockPagePerson)
      mockAccountApi.getByPersonId.mockResolvedValue(mockAccounts)
      mockLimitsApi.getByYear.mockResolvedValue(mockLimits)
    })

    it('displays person name in header', async () => {
      renderPersonDetail()

      await waitFor(() => {
        expect(screen.getByRole('heading', { level: 1, name: 'John Smith' })).toBeInTheDocument()
      })
    })

    it('displays age calculated from date of birth', async () => {
      renderPersonDetail()

      await waitFor(() => {
        expect(screen.getByText(/Age \d+/)).toBeInTheDocument()
      })
    })

    it('displays state in header', async () => {
      renderPersonDetail()

      await waitFor(() => {
        // State appears in both header and personal info - just verify it's present
        const stateElements = screen.getAllByText('California')
        expect(stateElements.length).toBeGreaterThanOrEqual(1)
      })
    })

    it('displays catch-up eligible badge for 50+ person', async () => {
      renderPersonDetail()

      await waitFor(() => {
        expect(screen.getByText('Catch-up Eligible')).toBeInTheDocument()
      })
    })

    it('displays Edit Profile link', async () => {
      renderPersonDetail()

      await waitFor(() => {
        expect(screen.getByRole('link', { name: /edit profile/i })).toHaveAttribute(
          'href',
          '/profile/edit'
        )
      })
    })
  })

  describe('Personal Information card', () => {
    beforeEach(() => {
      mockPersonApi.getAll.mockResolvedValue(mockPagePerson)
      mockAccountApi.getByPersonId.mockResolvedValue([])
      mockLimitsApi.getByYear.mockResolvedValue(mockLimits)
    })

    it('displays Personal Information section', async () => {
      renderPersonDetail()

      await waitFor(() => {
        expect(screen.getByRole('heading', { name: 'Personal Information' })).toBeInTheDocument()
      })
    })

    it('displays formatted date of birth', async () => {
      renderPersonDetail()

      await waitFor(() => {
        expect(screen.getByText('March 15, 1974')).toBeInTheDocument()
      })
    })

    it('displays formatted filing status', async () => {
      renderPersonDetail()

      await waitFor(() => {
        expect(screen.getByText('Married Filing Jointly')).toBeInTheDocument()
      })
    })

    it('displays 50+ Eligible badge for catch-up eligible person', async () => {
      renderPersonDetail()

      await waitFor(() => {
        expect(screen.getByText('50+ Eligible')).toBeInTheDocument()
      })
    })

    it('displays Under 50 badge for young person', async () => {
      mockPersonApi.getAll.mockResolvedValue({ ...mockPagePerson, content: [mockYoungPerson] })

      renderPersonDetail()

      await waitFor(() => {
        expect(screen.getByText('Under 50')).toBeInTheDocument()
      })
    })
  })

  describe('Contribution Room card', () => {
    beforeEach(() => {
      mockPersonApi.getAll.mockResolvedValue(mockPagePerson)
      mockAccountApi.getByPersonId.mockResolvedValue([])
      mockLimitsApi.getByYear.mockResolvedValue(mockLimits)
    })

    it('displays Contribution Room section with current year', async () => {
      renderPersonDetail()

      const currentYear = new Date().getFullYear()
      await waitFor(() => {
        expect(
          screen.getByRole('heading', { name: `${currentYear} Contribution Room` })
        ).toBeInTheDocument()
      })
    })

    it('displays 401(k) limit with catch-up for eligible person', async () => {
      renderPersonDetail()

      await waitFor(() => {
        expect(screen.getByText('$31K')).toBeInTheDocument()
        expect(screen.getByText('401(k) Limit')).toBeInTheDocument()
      })
    })

    it('displays IRA limit with catch-up for eligible person', async () => {
      renderPersonDetail()

      await waitFor(() => {
        expect(screen.getByText('$8K')).toBeInTheDocument()
        expect(screen.getByText('IRA Limit')).toBeInTheDocument()
      })
    })

    it('displays HSA limit with catch-up for eligible person', async () => {
      renderPersonDetail()

      await waitFor(() => {
        expect(screen.getByText('$5.3K')).toBeInTheDocument()
        expect(screen.getByText('HSA Limit')).toBeInTheDocument()
      })
    })

    it('displays base limits without catch-up for young person', async () => {
      mockPersonApi.getAll.mockResolvedValue({ ...mockPagePerson, content: [mockYoungPerson] })

      renderPersonDetail()

      await waitFor(() => {
        expect(screen.getByText('$23.5K')).toBeInTheDocument()
        expect(screen.getByText('$7K')).toBeInTheDocument()
        expect(screen.getByText('$4.3K')).toBeInTheDocument()
      })
    })
  })

  describe('Accounts card', () => {
    beforeEach(() => {
      mockPersonApi.getAll.mockResolvedValue(mockPagePerson)
      mockLimitsApi.getByYear.mockResolvedValue(mockLimits)
    })

    it('displays Accounts section', async () => {
      mockAccountApi.getByPersonId.mockResolvedValue(mockAccounts)

      renderPersonDetail()

      await waitFor(() => {
        expect(screen.getByRole('heading', { name: 'Accounts' })).toBeInTheDocument()
      })
    })

    it('displays Add Account button', async () => {
      mockAccountApi.getByPersonId.mockResolvedValue([])

      renderPersonDetail()

      await waitFor(() => {
        expect(screen.getByRole('link', { name: /add account/i })).toHaveAttribute(
          'href',
          '/accounts/new'
        )
      })
    })

    it('displays account list when accounts exist', async () => {
      mockAccountApi.getByPersonId.mockResolvedValue(mockAccounts)

      renderPersonDetail()

      await waitFor(() => {
        expect(screen.getByRole('list', { name: /account list/i })).toBeInTheDocument()
      })
    })

    it('displays account type name', async () => {
      mockAccountApi.getByPersonId.mockResolvedValue(mockAccounts)

      renderPersonDetail()

      await waitFor(() => {
        expect(screen.getByText('Traditional 401(k)')).toBeInTheDocument()
      })
    })

    it('displays custom account name when provided', async () => {
      mockAccountApi.getByPersonId.mockResolvedValue(mockAccounts)

      renderPersonDetail()

      await waitFor(() => {
        expect(screen.getByText('My Roth IRA')).toBeInTheDocument()
      })
    })

    it('displays employer name for employer accounts', async () => {
      mockAccountApi.getByPersonId.mockResolvedValue(mockAccounts)

      renderPersonDetail()

      await waitFor(() => {
        expect(screen.getByText('Employer: Acme Corp')).toBeInTheDocument()
      })
    })

    it('displays formatted account balance', async () => {
      mockAccountApi.getByPersonId.mockResolvedValue(mockAccounts)

      renderPersonDetail()

      await waitFor(() => {
        expect(screen.getByText('$245,000')).toBeInTheDocument()
        expect(screen.getByText('$68,500')).toBeInTheDocument()
      })
    })

    it('displays empty state when no accounts exist', async () => {
      mockAccountApi.getByPersonId.mockResolvedValue([])

      renderPersonDetail()

      await waitFor(() => {
        expect(screen.getByText('No accounts added yet.')).toBeInTheDocument()
        expect(screen.getByRole('link', { name: /add your first account/i })).toBeInTheDocument()
      })
    })
  })

  describe('Accessibility', () => {
    beforeEach(() => {
      mockPersonApi.getAll.mockResolvedValue(mockPagePerson)
      mockAccountApi.getByPersonId.mockResolvedValue(mockAccounts)
      mockLimitsApi.getByYear.mockResolvedValue(mockLimits)
    })

    it('uses semantic heading hierarchy', async () => {
      renderPersonDetail()

      await waitFor(() => {
        expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument()
        expect(screen.getAllByRole('heading', { level: 2 })).toHaveLength(3)
      })
    })

    it('uses aria-labelledby for sections', async () => {
      renderPersonDetail()

      await waitFor(() => {
        expect(screen.getByRole('region', { name: 'Personal Information' })).toBeInTheDocument()
      })
    })

    it('uses definition list for personal info', async () => {
      renderPersonDetail()

      await waitFor(() => {
        const terms = screen.getAllByRole('term')
        expect(terms.length).toBeGreaterThan(0)
      })
    })
  })
})
