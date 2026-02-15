import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MarriageHistory } from './MarriageHistory'
import * as api from '../../api/client'

vi.mock('../../api/client', async () => {
  const actual = await vi.importActual('../../api/client')
  return {
    ...actual,
    personApi: {
      getAll: vi.fn(),
    },
    marriageApi: {
      getByPersonId: vi.fn(),
      create: vi.fn(),
    },
  }
})

const mockPersonApi = api.personApi as {
  getAll: ReturnType<typeof vi.fn>
}

const mockMarriageApi = api.marriageApi as {
  getByPersonId: ReturnType<typeof vi.fn>
  create: ReturnType<typeof vi.fn>
}

function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  })
}

function renderMarriageHistory() {
  const queryClient = createQueryClient()
  return render(
    <QueryClientProvider client={queryClient}>
      <MarriageHistory />
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

const mockMarriages = [
  {
    id: 'm1',
    personId: '123',
    spouseFirstName: 'Sarah',
    spouseLastName: 'Johnson',
    marriageDate: '2010-06-15',
    status: 'MARRIED' as const,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'm2',
    personId: '123',
    spouseFirstName: 'Emily',
    spouseLastName: 'Davis',
    marriageDate: '2002-03-20',
    endDate: '2008-12-10',
    status: 'DIVORCED' as const,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
]

describe('MarriageHistory', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Loading state', () => {
    it('shows loading indicator while fetching data', () => {
      mockPersonApi.getAll.mockReturnValue(new Promise(() => {}))

      renderMarriageHistory()

      expect(screen.getByRole('status', { name: /loading marriage history/i })).toBeInTheDocument()
      expect(screen.getByText('Loading marriage history...')).toBeInTheDocument()
    })
  })

  describe('Error state', () => {
    it('shows error message when person API fails', async () => {
      mockPersonApi.getAll.mockRejectedValue(new Error('Network error'))

      renderMarriageHistory()

      await waitFor(() => {
        expect(screen.getByRole('alert')).toBeInTheDocument()
      })
      expect(screen.getByText(/failed to load marriage history/i)).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /retry/i })).toBeInTheDocument()
    })

    it('shows error message when marriage API fails', async () => {
      mockPersonApi.getAll.mockResolvedValue([mockPerson])
      mockMarriageApi.getByPersonId.mockRejectedValue(new Error('Network error'))

      renderMarriageHistory()

      await waitFor(() => {
        expect(screen.getByRole('alert')).toBeInTheDocument()
      })
    })
  })

  describe('Empty state', () => {
    it('shows empty state when no marriages exist', async () => {
      mockPersonApi.getAll.mockResolvedValue([mockPerson])
      mockMarriageApi.getByPersonId.mockResolvedValue([])

      renderMarriageHistory()

      await waitFor(() => {
        expect(screen.getByText('No marriage history recorded yet.')).toBeInTheDocument()
      })
      expect(screen.getByRole('button', { name: /add your first marriage/i })).toBeInTheDocument()
    })

    it('shows message when no person profile exists', async () => {
      mockPersonApi.getAll.mockResolvedValue([])

      renderMarriageHistory()

      await waitFor(() => {
        expect(screen.getByText(/please create a profile first/i)).toBeInTheDocument()
      })
    })
  })

  describe('Marriage list display', () => {
    beforeEach(() => {
      mockPersonApi.getAll.mockResolvedValue([mockPerson])
      mockMarriageApi.getByPersonId.mockResolvedValue(mockMarriages)
    })

    it('displays Marriage History title', async () => {
      renderMarriageHistory()

      await waitFor(() => {
        expect(screen.getByRole('heading', { name: 'Marriage History' })).toBeInTheDocument()
      })
    })

    it('displays Add Marriage button', async () => {
      renderMarriageHistory()

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /add marriage/i })).toBeInTheDocument()
      })
    })

    it('displays info box about SS benefits', async () => {
      renderMarriageHistory()

      await waitFor(() => {
        expect(screen.getByText(/why track this\?/i)).toBeInTheDocument()
        expect(screen.getByText(/social security spousal benefits/i)).toBeInTheDocument()
      })
    })

    it('displays spouse names', async () => {
      renderMarriageHistory()

      await waitFor(() => {
        expect(screen.getByText('Sarah Johnson')).toBeInTheDocument()
        expect(screen.getByText('Emily Davis')).toBeInTheDocument()
      })
    })

    it('displays marriage status badges', async () => {
      renderMarriageHistory()

      await waitFor(() => {
        expect(screen.getByText('Married')).toBeInTheDocument()
        expect(screen.getByText('Divorced')).toBeInTheDocument()
      })
    })

    it('displays SS Eligible badge for 10+ year marriages', async () => {
      renderMarriageHistory()

      await waitFor(() => {
        expect(screen.getByText('SS Eligible')).toBeInTheDocument()
      })
    })

    it('displays Not SS Eligible badge for shorter marriages', async () => {
      renderMarriageHistory()

      await waitFor(() => {
        expect(screen.getByText('Not SS Eligible')).toBeInTheDocument()
      })
    })

    it('displays duration progress bars', async () => {
      renderMarriageHistory()

      await waitFor(() => {
        const progressBars = screen.getAllByRole('progressbar')
        expect(progressBars.length).toBe(2)
      })
    })

    it('displays Present for ongoing marriages', async () => {
      renderMarriageHistory()

      await waitFor(() => {
        expect(screen.getByText(/present/i)).toBeInTheDocument()
      })
    })
  })

  describe('Add Marriage modal', () => {
    beforeEach(() => {
      mockPersonApi.getAll.mockResolvedValue([mockPerson])
      mockMarriageApi.getByPersonId.mockResolvedValue([])
    })

    it('opens modal when Add Marriage button is clicked', async () => {
      const user = userEvent.setup()
      renderMarriageHistory()

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /add marriage/i })).toBeInTheDocument()
      })

      await user.click(screen.getByRole('button', { name: /add marriage/i }))

      expect(screen.getByRole('dialog')).toBeInTheDocument()
      expect(screen.getByRole('heading', { name: /add marriage/i })).toBeInTheDocument()
    })

    it('opens modal from empty state button', async () => {
      const user = userEvent.setup()
      renderMarriageHistory()

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /add your first marriage/i })).toBeInTheDocument()
      })

      await user.click(screen.getByRole('button', { name: /add your first marriage/i }))

      expect(screen.getByRole('dialog')).toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    beforeEach(() => {
      mockPersonApi.getAll.mockResolvedValue([mockPerson])
      mockMarriageApi.getByPersonId.mockResolvedValue(mockMarriages)
    })

    it('uses semantic heading structure', async () => {
      renderMarriageHistory()

      await waitFor(() => {
        expect(
          screen.getByRole('heading', { level: 2, name: 'Marriage History' })
        ).toBeInTheDocument()
      })

      const h3Elements = screen.getAllByRole('heading', { level: 3 })
      expect(h3Elements.length).toBe(2)
    })

    it('uses role=list for marriage list', async () => {
      renderMarriageHistory()

      await waitFor(() => {
        expect(screen.getByRole('list', { name: /marriage history/i })).toBeInTheDocument()
      })
    })

    it('progress bars have accessible labels', async () => {
      renderMarriageHistory()

      await waitFor(() => {
        const progressBars = screen.getAllByRole('progressbar')
        progressBars.forEach(bar => {
          expect(bar).toHaveAttribute('aria-valuenow')
          expect(bar).toHaveAttribute('aria-valuemin', '0')
          expect(bar).toHaveAttribute('aria-valuemax', '100')
          expect(bar).toHaveAttribute('aria-label')
        })
      })
    })
  })
})
