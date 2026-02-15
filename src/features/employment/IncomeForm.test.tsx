import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { IncomeForm } from './IncomeForm'
import * as api from '../../api/client'

vi.mock('../../api/client', async () => {
  const actual = await vi.importActual('../../api/client')
  return {
    ...actual,
    employmentIncomeApi: {
      create: vi.fn(),
      update: vi.fn(),
    },
  }
})

const mockEmploymentIncomeApi = api.employmentIncomeApi as {
  create: ReturnType<typeof vi.fn>
  update: ReturnType<typeof vi.fn>
}

function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  })
}

function renderIncomeForm(props = {}) {
  const defaultProps = {
    employmentId: 'emp-123',
    personId: 'person-123',
    onClose: vi.fn(),
    onSuccess: vi.fn(),
  }
  const mergedProps = { ...defaultProps, ...props }
  const queryClient = createQueryClient()

  return {
    ...render(
      <QueryClientProvider client={queryClient}>
        <IncomeForm {...mergedProps} />
      </QueryClientProvider>
    ),
    onClose: mergedProps.onClose,
    onSuccess: mergedProps.onSuccess,
  }
}

describe('IncomeForm', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Rendering', () => {
    it('renders dialog with title for add mode', () => {
      renderIncomeForm()

      expect(screen.getByRole('dialog')).toBeInTheDocument()
      expect(screen.getByRole('heading', { name: /add income/i })).toBeInTheDocument()
    })

    it('renders dialog with title for edit mode', () => {
      renderIncomeForm({
        income: {
          id: '1',
          employmentId: 'emp-123',
          year: 2024,
          annualSalary: 120000,
          bonus: 15000,
          otherCompensation: 5000,
          totalCompensation: 140000,
          createdAt: '2024-01-01',
          updatedAt: '2024-01-01',
        },
      })

      expect(screen.getByRole('heading', { name: /edit income/i })).toBeInTheDocument()
    })

    it('renders all form fields', () => {
      renderIncomeForm()

      expect(screen.getByLabelText(/tax year/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/annual salary/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/bonus/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/other compensation/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/w-2 wages/i)).toBeInTheDocument()
    })

    it('renders Cancel and Save Income buttons', () => {
      renderIncomeForm()

      expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /save income/i })).toBeInTheDocument()
    })

    it('shows total compensation', () => {
      renderIncomeForm()

      expect(screen.getByText(/total compensation/i)).toBeInTheDocument()
    })
  })

  describe('Form validation', () => {
    it('shows error for invalid year', async () => {
      const user = userEvent.setup()
      renderIncomeForm()

      await user.clear(screen.getByLabelText(/tax year/i))
      await user.type(screen.getByLabelText(/tax year/i), '1800')
      await user.click(screen.getByRole('button', { name: /save income/i }))

      await waitFor(() => {
        expect(screen.getByText(/please enter a valid year/i)).toBeInTheDocument()
      })
    })

    it('shows error for invalid salary', async () => {
      const user = userEvent.setup()
      renderIncomeForm()

      await user.click(screen.getByRole('button', { name: /save income/i }))

      await waitFor(() => {
        expect(screen.getByText(/please enter a valid salary/i)).toBeInTheDocument()
      })
    })
  })

  describe('Form submission', () => {
    it('calls API with form data on successful submission', async () => {
      const user = userEvent.setup()
      mockEmploymentIncomeApi.create.mockResolvedValue({ id: 'new-income' })
      const { onSuccess } = renderIncomeForm()

      await user.type(screen.getByLabelText(/annual salary/i), '120000')
      await user.click(screen.getByRole('button', { name: /save income/i }))

      await waitFor(() => {
        expect(mockEmploymentIncomeApi.create).toHaveBeenCalledWith(
          expect.objectContaining({
            employmentId: 'emp-123',
            annualSalary: 120000,
          })
        )
      })
      expect(onSuccess).toHaveBeenCalled()
    })

    it('shows saving state during submission', async () => {
      const user = userEvent.setup()
      mockEmploymentIncomeApi.create.mockImplementation(() => new Promise(() => {}))
      renderIncomeForm()

      await user.type(screen.getByLabelText(/annual salary/i), '120000')
      await user.click(screen.getByRole('button', { name: /save income/i }))

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /saving/i })).toBeDisabled()
      })
    })

    it('shows error message on API failure', async () => {
      const user = userEvent.setup()
      mockEmploymentIncomeApi.create.mockRejectedValue(new Error('API Error'))
      renderIncomeForm()

      await user.type(screen.getByLabelText(/annual salary/i), '120000')
      await user.click(screen.getByRole('button', { name: /save income/i }))

      await waitFor(() => {
        expect(screen.getByRole('alert')).toBeInTheDocument()
        expect(screen.getByText(/failed to add income/i)).toBeInTheDocument()
      })
    })
  })

  describe('Edit mode', () => {
    it('disables year field in edit mode', () => {
      renderIncomeForm({
        income: {
          id: '1',
          employmentId: 'emp-123',
          year: 2024,
          annualSalary: 120000,
          bonus: 15000,
          otherCompensation: 5000,
          totalCompensation: 140000,
          createdAt: '2024-01-01',
          updatedAt: '2024-01-01',
        },
      })

      expect(screen.getByLabelText(/tax year/i)).toBeDisabled()
    })

    it('pre-fills form with existing values', () => {
      renderIncomeForm({
        income: {
          id: '1',
          employmentId: 'emp-123',
          year: 2024,
          annualSalary: 120000,
          bonus: 15000,
          otherCompensation: 5000,
          totalCompensation: 140000,
          createdAt: '2024-01-01',
          updatedAt: '2024-01-01',
        },
      })

      expect(screen.getByLabelText(/tax year/i)).toHaveValue(2024)
      expect(screen.getByLabelText(/annual salary/i)).toHaveValue(120000)
      expect(screen.getByLabelText(/^bonus$/i)).toHaveValue(15000)
      expect(screen.getByLabelText(/other compensation/i)).toHaveValue(5000)
    })
  })

  describe('Modal interactions', () => {
    it('calls onClose when Cancel button is clicked', async () => {
      const user = userEvent.setup()
      const { onClose } = renderIncomeForm()

      await user.click(screen.getByRole('button', { name: /cancel/i }))

      expect(onClose).toHaveBeenCalled()
    })

    it('calls onClose when close button is clicked', async () => {
      const user = userEvent.setup()
      const { onClose } = renderIncomeForm()

      await user.click(screen.getByRole('button', { name: /close dialog/i }))

      expect(onClose).toHaveBeenCalled()
    })

    it('calls onClose when Escape key is pressed', async () => {
      const user = userEvent.setup()
      const { onClose } = renderIncomeForm()

      await user.keyboard('{Escape}')

      expect(onClose).toHaveBeenCalled()
    })
  })

  describe('Accessibility', () => {
    it('has aria-modal attribute', () => {
      renderIncomeForm()

      expect(screen.getByRole('dialog')).toHaveAttribute('aria-modal', 'true')
    })

    it('has aria-labelledby pointing to title', () => {
      renderIncomeForm()

      const dialog = screen.getByRole('dialog')
      const titleId = dialog.getAttribute('aria-labelledby')
      expect(titleId).toBeTruthy()
      expect(document.getElementById(titleId!)).toHaveTextContent(/add income/i)
    })

    it('focuses first input on open', () => {
      renderIncomeForm()

      expect(screen.getByLabelText(/tax year/i)).toHaveFocus()
    })
  })
})
