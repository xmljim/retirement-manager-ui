import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { App } from './App'
import * as api from './api/client'

// Mock the API module for PersonDetail
vi.mock('./api/client', async () => {
  const actual = await vi.importActual('./api/client')
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
}

const mockAccountApi = api.accountApi as {
  getByPersonId: ReturnType<typeof vi.fn>
}

const mockLimitsApi = api.limitsApi as {
  getByYear: ReturnType<typeof vi.fn>
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

function renderWithRouter(initialRoute = '/') {
  const queryClient = createQueryClient()
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[initialRoute]}>
        <App />
      </MemoryRouter>
    </QueryClientProvider>
  )
}

describe('App', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Default mock for profile page - empty to show "Profile" heading
    mockPersonApi.getAll.mockResolvedValue([])
  })

  it('renders the sidebar with navigation', () => {
    renderWithRouter()

    expect(screen.getByText('RetireWise')).toBeInTheDocument()
    expect(screen.getByText('Dashboard')).toBeInTheDocument()
    expect(screen.getByText('Profile')).toBeInTheDocument()
    expect(screen.getByText('Limits')).toBeInTheDocument()
  })

  it('renders the dashboard at the root route', () => {
    renderWithRouter('/')

    expect(screen.getByText(/Good morning/)).toBeInTheDocument()
    expect(screen.getByText('Your Accounts')).toBeInTheDocument()
  })

  it('renders the profile page at /profile', async () => {
    // Mock empty response to show "Profile" heading in empty state
    mockPersonApi.getAll.mockResolvedValue([])

    renderWithRouter('/profile')

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Profile' })).toBeInTheDocument()
    })
  })

  it('renders the profile form at /profile/edit', () => {
    renderWithRouter('/profile/edit')

    expect(screen.getByRole('heading', { name: 'Edit Profile' })).toBeInTheDocument()
    expect(screen.getByLabelText(/First Name/)).toBeInTheDocument()
    expect(screen.getByLabelText(/Last Name/)).toBeInTheDocument()
  })

  it('renders the limits page at /limits', () => {
    renderWithRouter('/limits')

    expect(screen.getByRole('heading', { name: '2025 Contribution Limits' })).toBeInTheDocument()
    expect(screen.getByText('401(k) Employee Contribution')).toBeInTheDocument()
  })

  it('renders person name when profile exists', async () => {
    const mockPerson = {
      id: '123',
      firstName: 'Jane',
      lastName: 'Doe',
      dateOfBirth: '1980-01-01',
      filingStatus: 'SINGLE' as const,
      state: 'Texas',
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
    }
    mockPersonApi.getAll.mockResolvedValue({
      content: [mockPerson],
      totalElements: 1,
      totalPages: 1,
      size: 1,
      number: 0,
      first: true,
      last: true,
      empty: false,
    })
    mockAccountApi.getByPersonId.mockResolvedValue([])
    mockLimitsApi.getByYear.mockResolvedValue({
      year: 2025,
      contributionLimits: [
        { id: '1', year: 2025, accountType: 'TRADITIONAL_401K', limitType: 'BASE', amount: 23500 },
        { id: '2', year: 2025, accountType: 'TRADITIONAL_IRA', limitType: 'BASE', amount: 7000 },
        { id: '3', year: 2025, accountType: 'HSA_SELF', limitType: 'BASE', amount: 4300 },
      ],
      phaseOutRanges: [],
    })

    renderWithRouter('/profile')

    await waitFor(() => {
      expect(screen.getByRole('heading', { level: 1, name: 'Jane Doe' })).toBeInTheDocument()
    })
  })
})
