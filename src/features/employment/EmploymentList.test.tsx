import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { EmploymentList } from './EmploymentList'
import * as api from '../../api/client'

vi.mock('../../api/client', async () => {
  const actual = await vi.importActual('../../api/client')
  return {
    ...actual,
    employmentApi: {
      getByPersonId: vi.fn(),
    },
    employerApi: {
      getAll: vi.fn(),
      create: vi.fn(),
    },
  }
})

const mockEmploymentApi = api.employmentApi as {
  getByPersonId: ReturnType<typeof vi.fn>
}

const mockEmployerApi = api.employerApi as {
  getAll: ReturnType<typeof vi.fn>
  create: ReturnType<typeof vi.fn>
}

function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  })
}

function renderEmploymentList(props = {}) {
  const defaultProps = {
    personId: '123',
  }
  const mergedProps = { ...defaultProps, ...props }
  const queryClient = createQueryClient()

  return {
    ...render(
      <QueryClientProvider client={queryClient}>
        <EmploymentList {...mergedProps} />
      </QueryClientProvider>
    ),
  }
}

const mockEmployment = [
  {
    id: '1',
    personId: '123',
    employerId: 'emp-1',
    employerName: 'Acme Corp',
    jobTitle: 'Software Engineer',
    startDate: '2020-01-15',
    endDate: null,
    employmentType: 'FULL_TIME' as const,
    retirementPlanEligible: true,
    current: true,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01',
  },
  {
    id: '2',
    personId: '123',
    employerId: 'emp-2',
    employerName: 'Tech Startup',
    jobTitle: 'Junior Developer',
    startDate: '2018-06-01',
    endDate: '2019-12-31',
    employmentType: 'FULL_TIME' as const,
    retirementPlanEligible: false,
    current: false,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01',
  },
]

describe('EmploymentList', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Loading state', () => {
    it('shows loading indicator while fetching data', () => {
      mockEmploymentApi.getByPersonId.mockImplementation(() => new Promise(() => {}))
      renderEmploymentList()

      expect(screen.getByRole('status', { name: /loading/i })).toBeInTheDocument()
      expect(screen.getByText(/loading employment history/i)).toBeInTheDocument()
    })
  })

  describe('Error state', () => {
    it('shows error message when API fails', async () => {
      mockEmploymentApi.getByPersonId.mockRejectedValue(new Error('API Error'))
      renderEmploymentList()

      await waitFor(() => {
        expect(screen.getByRole('alert')).toBeInTheDocument()
        expect(screen.getByText(/failed to load employment history/i)).toBeInTheDocument()
      })
    })

    it('shows retry button on error', async () => {
      mockEmploymentApi.getByPersonId.mockRejectedValue(new Error('API Error'))
      renderEmploymentList()

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /retry/i })).toBeInTheDocument()
      })
    })
  })

  describe('Empty state', () => {
    it('shows empty state when no employments', async () => {
      mockEmploymentApi.getByPersonId.mockResolvedValue([])
      renderEmploymentList()

      await waitFor(() => {
        expect(screen.getByText(/no employment history recorded/i)).toBeInTheDocument()
      })
    })

    it('shows add first job button in empty state', async () => {
      mockEmploymentApi.getByPersonId.mockResolvedValue([])
      renderEmploymentList()

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /add your first job/i })).toBeInTheDocument()
      })
    })
  })

  describe('Employment list display', () => {
    it('shows employment history header', async () => {
      mockEmploymentApi.getByPersonId.mockResolvedValue(mockEmployment)
      renderEmploymentList()

      await waitFor(() => {
        expect(screen.getByRole('heading', { name: /employment history/i })).toBeInTheDocument()
      })
    })

    it('shows add employment button', async () => {
      mockEmploymentApi.getByPersonId.mockResolvedValue(mockEmployment)
      renderEmploymentList()

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /add employment/i })).toBeInTheDocument()
      })
    })

    it('displays employment items', async () => {
      mockEmploymentApi.getByPersonId.mockResolvedValue(mockEmployment)
      renderEmploymentList()

      await waitFor(() => {
        expect(screen.getByText('Acme Corp')).toBeInTheDocument()
        expect(screen.getByText('Tech Startup')).toBeInTheDocument()
      })
    })

    it('shows current badge for current employment', async () => {
      mockEmploymentApi.getByPersonId.mockResolvedValue(mockEmployment)
      renderEmploymentList()

      await waitFor(() => {
        expect(screen.getByText('Current')).toBeInTheDocument()
      })
    })

    it('shows employment type badge', async () => {
      mockEmploymentApi.getByPersonId.mockResolvedValue(mockEmployment)
      renderEmploymentList()

      await waitFor(() => {
        expect(screen.getAllByText('Full-Time')).toHaveLength(2)
      })
    })

    it('shows job title when available', async () => {
      mockEmploymentApi.getByPersonId.mockResolvedValue(mockEmployment)
      renderEmploymentList()

      await waitFor(() => {
        expect(screen.getByText('Software Engineer')).toBeInTheDocument()
        expect(screen.getByText('Junior Developer')).toBeInTheDocument()
      })
    })

    it('shows 401k eligible indicator', async () => {
      mockEmploymentApi.getByPersonId.mockResolvedValue(mockEmployment)
      renderEmploymentList()

      await waitFor(() => {
        expect(screen.getByText(/401\(k\) eligible/i)).toBeInTheDocument()
      })
    })
  })

  describe('Add employment modal', () => {
    it('opens add employment modal when button is clicked', async () => {
      mockEmploymentApi.getByPersonId.mockResolvedValue(mockEmployment)
      mockEmployerApi.getAll.mockResolvedValue({ content: [], totalElements: 0 })
      const user = userEvent.setup()
      renderEmploymentList()

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /add employment/i })).toBeInTheDocument()
      })

      await user.click(screen.getByRole('button', { name: /add employment/i }))

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument()
        expect(screen.getByRole('heading', { name: /add employment/i })).toBeInTheDocument()
      })
    })
  })
})
