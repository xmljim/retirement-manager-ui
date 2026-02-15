import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter } from 'react-router'
import { EmploymentPage } from './EmploymentPage'
import * as api from '../../api/client'

vi.mock('../../api/client', async () => {
  const actual = await vi.importActual('../../api/client')
  return {
    ...actual,
    personApi: {
      getAll: vi.fn(),
    },
    employmentApi: {
      getByPersonId: vi.fn(),
    },
    employerApi: {
      getAll: vi.fn(),
    },
  }
})

const mockPersonApi = api.personApi as {
  getAll: ReturnType<typeof vi.fn>
}

const mockEmploymentApi = api.employmentApi as {
  getByPersonId: ReturnType<typeof vi.fn>
}

function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  })
}

function renderEmploymentPage() {
  const queryClient = createQueryClient()

  return render(
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <EmploymentPage />
      </BrowserRouter>
    </QueryClientProvider>
  )
}

const mockPerson = {
  id: '123',
  firstName: 'John',
  lastName: 'Doe',
  dateOfBirth: '1980-05-15',
  filingStatus: 'SINGLE' as const,
  createdAt: '2024-01-01',
  updatedAt: '2024-01-01',
}

describe('EmploymentPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Loading state', () => {
    it('shows loading indicator while fetching person', () => {
      mockPersonApi.getAll.mockImplementation(() => new Promise(() => {}))
      renderEmploymentPage()

      expect(screen.getByRole('status', { name: /loading/i })).toBeInTheDocument()
      expect(screen.getByText(/loading/i)).toBeInTheDocument()
    })
  })

  describe('Error state', () => {
    it('shows error message when API fails', async () => {
      mockPersonApi.getAll.mockRejectedValue(new Error('API Error'))
      renderEmploymentPage()

      await waitFor(() => {
        expect(screen.getByRole('alert')).toBeInTheDocument()
        expect(screen.getByText(/failed to load profile/i)).toBeInTheDocument()
      })
    })

    it('shows retry button on error', async () => {
      mockPersonApi.getAll.mockRejectedValue(new Error('API Error'))
      renderEmploymentPage()

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /retry/i })).toBeInTheDocument()
      })
    })
  })

  describe('No profile state', () => {
    it('shows create profile message when no person exists', async () => {
      mockPersonApi.getAll.mockResolvedValue({ content: [], totalElements: 0 })
      renderEmploymentPage()

      await waitFor(() => {
        expect(
          screen.getByText(/please create a profile first to track employment/i)
        ).toBeInTheDocument()
      })
    })

    it('shows create profile link', async () => {
      mockPersonApi.getAll.mockResolvedValue({ content: [], totalElements: 0 })
      renderEmploymentPage()

      await waitFor(() => {
        expect(screen.getByRole('link', { name: /create profile/i })).toBeInTheDocument()
      })
    })
  })

  describe('With person', () => {
    it('shows page title', async () => {
      mockPersonApi.getAll.mockResolvedValue({ content: [mockPerson], totalElements: 1 })
      mockEmploymentApi.getByPersonId.mockResolvedValue([])
      renderEmploymentPage()

      await waitFor(() => {
        expect(screen.getByRole('heading', { level: 1, name: /employment/i })).toBeInTheDocument()
      })
    })

    it('shows page description', async () => {
      mockPersonApi.getAll.mockResolvedValue({ content: [mockPerson], totalElements: 1 })
      mockEmploymentApi.getByPersonId.mockResolvedValue([])
      renderEmploymentPage()

      await waitFor(() => {
        expect(
          screen.getByText(/track your employment history and income for retirement planning/i)
        ).toBeInTheDocument()
      })
    })

    it('shows info box', async () => {
      mockPersonApi.getAll.mockResolvedValue({ content: [mockPerson], totalElements: 1 })
      mockEmploymentApi.getByPersonId.mockResolvedValue([])
      renderEmploymentPage()

      await waitFor(() => {
        expect(screen.getByText(/why track employment/i)).toBeInTheDocument()
      })
    })

    it('renders employment list', async () => {
      mockPersonApi.getAll.mockResolvedValue({ content: [mockPerson], totalElements: 1 })
      mockEmploymentApi.getByPersonId.mockResolvedValue([])
      renderEmploymentPage()

      await waitFor(() => {
        expect(screen.getByRole('heading', { name: /employment history/i })).toBeInTheDocument()
      })
    })
  })
})
