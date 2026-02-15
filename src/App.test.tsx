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
      getByPersonId: vi.fn(),
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
  getByPersonId: ReturnType<typeof vi.fn>
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
    mockPersonApi.getAll.mockResolvedValue([mockPerson])
    mockAccountApi.getByPersonId.mockResolvedValue([])
    mockLimitsApi.getByPersonId.mockResolvedValue({
      year: 2025,
      traditional401kLimit: 23500,
      roth401kLimit: 23500,
      catchUp401kLimit: 7500,
      traditionalIraLimit: 7000,
      rothIraLimit: 7000,
      catchUpIraLimit: 1000,
      hsaIndividualLimit: 4300,
      hsaFamilyLimit: 8550,
      catchUpHsaLimit: 1000,
    })

    renderWithRouter('/profile')

    await waitFor(() => {
      expect(screen.getByRole('heading', { level: 1, name: 'Jane Doe' })).toBeInTheDocument()
    })
  })
})
