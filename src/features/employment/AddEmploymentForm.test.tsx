import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AddEmploymentForm } from './AddEmploymentForm'
import * as api from '../../api/client'

vi.mock('../../api/client', async () => {
  const actual = await vi.importActual('../../api/client')
  return {
    ...actual,
    employmentApi: {
      create: vi.fn(),
    },
    employerApi: {
      getAll: vi.fn(),
      create: vi.fn(),
    },
  }
})

const mockEmploymentApi = api.employmentApi as {
  create: ReturnType<typeof vi.fn>
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

function renderAddEmploymentForm(props = {}) {
  const defaultProps = {
    personId: '123',
    onClose: vi.fn(),
    onSuccess: vi.fn(),
  }
  const mergedProps = { ...defaultProps, ...props }
  const queryClient = createQueryClient()

  return {
    ...render(
      <QueryClientProvider client={queryClient}>
        <AddEmploymentForm {...mergedProps} />
      </QueryClientProvider>
    ),
    onClose: mergedProps.onClose,
    onSuccess: mergedProps.onSuccess,
  }
}

const mockEmployers = {
  content: [
    {
      id: 'emp-1',
      name: 'Acme Corp',
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01',
    },
    {
      id: 'emp-2',
      name: 'Tech Startup',
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01',
    },
  ],
  totalElements: 2,
}

describe('AddEmploymentForm', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockEmployerApi.getAll.mockResolvedValue(mockEmployers)
  })

  describe('Rendering', () => {
    it('renders dialog with title', async () => {
      renderAddEmploymentForm()

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument()
        expect(screen.getByRole('heading', { name: /add employment/i })).toBeInTheDocument()
      })
    })

    it('renders all form fields', async () => {
      renderAddEmploymentForm()

      await waitFor(() => {
        expect(screen.getByRole('combobox', { name: /employer/i })).toBeInTheDocument()
        expect(screen.getByLabelText(/job title/i)).toBeInTheDocument()
        expect(screen.getByLabelText(/employment type/i)).toBeInTheDocument()
        expect(screen.getByLabelText(/start date/i)).toBeInTheDocument()
        expect(screen.getByLabelText(/i currently work here/i)).toBeInTheDocument()
        expect(screen.getByLabelText(/eligible for employer retirement plan/i)).toBeInTheDocument()
      })
    })

    it('renders Cancel and Save Employment buttons', async () => {
      renderAddEmploymentForm()

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument()
        expect(screen.getByRole('button', { name: /save employment/i })).toBeInTheDocument()
      })
    })

    it('renders add new employer button', async () => {
      renderAddEmploymentForm()

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /add new employer/i })).toBeInTheDocument()
      })
    })
  })

  describe('Form validation', () => {
    it('shows error when employer is not selected', async () => {
      const user = userEvent.setup()
      renderAddEmploymentForm()

      await waitFor(() => {
        expect(screen.getByRole('combobox', { name: /employer/i })).toBeInTheDocument()
      })

      await user.click(screen.getByRole('button', { name: /save employment/i }))

      await waitFor(() => {
        expect(screen.getByText(/please select an employer/i)).toBeInTheDocument()
      })
    })

    it('shows error when start date is empty', async () => {
      const user = userEvent.setup()
      renderAddEmploymentForm()

      // Wait for employers to be loaded
      await waitFor(() => {
        expect(screen.getByRole('option', { name: 'Acme Corp' })).toBeInTheDocument()
      })

      await user.selectOptions(screen.getByRole('combobox', { name: /employer/i }), 'emp-1')
      await user.click(screen.getByRole('button', { name: /save employment/i }))

      await waitFor(() => {
        expect(screen.getByText(/start date is required/i)).toBeInTheDocument()
      })
    })
  })

  describe('End date visibility', () => {
    it('does not show end date when currently employed is checked', async () => {
      renderAddEmploymentForm()

      await waitFor(() => {
        expect(screen.queryByLabelText(/end date/i)).not.toBeInTheDocument()
      })
    })

    it('shows end date when currently employed is unchecked', async () => {
      const user = userEvent.setup()
      renderAddEmploymentForm()

      await waitFor(() => {
        expect(screen.getByLabelText(/i currently work here/i)).toBeInTheDocument()
      })

      await user.click(screen.getByLabelText(/i currently work here/i))

      await waitFor(() => {
        expect(screen.getByLabelText(/end date/i)).toBeInTheDocument()
      })
    })
  })

  describe('Form submission', () => {
    it('calls API with form data on successful submission', async () => {
      const user = userEvent.setup()
      mockEmploymentApi.create.mockResolvedValue({ id: 'new-employment' })
      const { onSuccess } = renderAddEmploymentForm()

      // Wait for employers to be loaded
      await waitFor(() => {
        expect(screen.getByRole('option', { name: 'Acme Corp' })).toBeInTheDocument()
      })

      await user.selectOptions(screen.getByRole('combobox', { name: /employer/i }), 'emp-1')
      await user.type(screen.getByLabelText(/job title/i), 'Software Engineer')
      await user.type(screen.getByLabelText(/start date/i), '2020-01-15')
      await user.click(screen.getByRole('button', { name: /save employment/i }))

      await waitFor(() => {
        expect(mockEmploymentApi.create).toHaveBeenCalledWith({
          personId: '123',
          employerId: 'emp-1',
          jobTitle: 'Software Engineer',
          startDate: '2020-01-15',
          employmentType: 'FULL_TIME',
          retirementPlanEligible: true,
        })
      })
      expect(onSuccess).toHaveBeenCalled()
    })

    it('shows saving state during submission', async () => {
      const user = userEvent.setup()
      mockEmploymentApi.create.mockImplementation(() => new Promise(() => {}))
      renderAddEmploymentForm()

      // Wait for employers to be loaded
      await waitFor(() => {
        expect(screen.getByRole('option', { name: 'Acme Corp' })).toBeInTheDocument()
      })

      await user.selectOptions(screen.getByRole('combobox', { name: /employer/i }), 'emp-1')
      await user.type(screen.getByLabelText(/start date/i), '2020-01-15')
      await user.click(screen.getByRole('button', { name: /save employment/i }))

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /saving/i })).toBeDisabled()
      })
    })

    it('shows error message on API failure', async () => {
      const user = userEvent.setup()
      mockEmploymentApi.create.mockRejectedValue(new Error('API Error'))
      renderAddEmploymentForm()

      // Wait for employers to be loaded
      await waitFor(() => {
        expect(screen.getByRole('option', { name: 'Acme Corp' })).toBeInTheDocument()
      })

      await user.selectOptions(screen.getByRole('combobox', { name: /employer/i }), 'emp-1')
      await user.type(screen.getByLabelText(/start date/i), '2020-01-15')
      await user.click(screen.getByRole('button', { name: /save employment/i }))

      await waitFor(() => {
        expect(screen.getByRole('alert')).toBeInTheDocument()
        expect(screen.getByText(/failed to add employment/i)).toBeInTheDocument()
      })
    })
  })

  describe('Modal interactions', () => {
    it('calls onClose when Cancel button is clicked', async () => {
      const user = userEvent.setup()
      const { onClose } = renderAddEmploymentForm()

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument()
      })

      await user.click(screen.getByRole('button', { name: /cancel/i }))

      expect(onClose).toHaveBeenCalled()
    })

    it('calls onClose when close button is clicked', async () => {
      const user = userEvent.setup()
      const { onClose } = renderAddEmploymentForm()

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /close dialog/i })).toBeInTheDocument()
      })

      await user.click(screen.getByRole('button', { name: /close dialog/i }))

      expect(onClose).toHaveBeenCalled()
    })

    it('calls onClose when Escape key is pressed', async () => {
      const user = userEvent.setup()
      const { onClose } = renderAddEmploymentForm()

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument()
      })

      await user.keyboard('{Escape}')

      expect(onClose).toHaveBeenCalled()
    })
  })

  describe('Accessibility', () => {
    it('has aria-modal attribute', async () => {
      renderAddEmploymentForm()

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toHaveAttribute('aria-modal', 'true')
      })
    })

    it('has aria-labelledby pointing to title', async () => {
      renderAddEmploymentForm()

      await waitFor(() => {
        const dialog = screen.getByRole('dialog')
        const titleId = dialog.getAttribute('aria-labelledby')
        expect(titleId).toBeTruthy()
        expect(document.getElementById(titleId!)).toHaveTextContent(/add employment/i)
      })
    })
  })
})
