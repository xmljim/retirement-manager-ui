import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { EmployerForm } from './EmployerForm'
import * as api from '../../api/client'

vi.mock('../../api/client', async () => {
  const actual = await vi.importActual('../../api/client')
  return {
    ...actual,
    employerApi: {
      create: vi.fn(),
      update: vi.fn(),
    },
  }
})

const mockEmployerApi = api.employerApi as {
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

function renderEmployerForm(props = {}) {
  const defaultProps = {
    onClose: vi.fn(),
    onSuccess: vi.fn(),
  }
  const mergedProps = { ...defaultProps, ...props }
  const queryClient = createQueryClient()

  return {
    ...render(
      <QueryClientProvider client={queryClient}>
        <EmployerForm {...mergedProps} />
      </QueryClientProvider>
    ),
    onClose: mergedProps.onClose,
    onSuccess: mergedProps.onSuccess,
  }
}

describe('EmployerForm', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Rendering', () => {
    it('renders dialog with title for add mode', () => {
      renderEmployerForm()

      expect(screen.getByRole('dialog')).toBeInTheDocument()
      expect(screen.getByRole('heading', { name: /add employer/i })).toBeInTheDocument()
    })

    it('renders dialog with title for edit mode', () => {
      renderEmployerForm({
        employer: {
          id: '1',
          name: 'Acme Corp',
          createdAt: '2024-01-01',
          updatedAt: '2024-01-01',
        },
      })

      expect(screen.getByRole('heading', { name: /edit employer/i })).toBeInTheDocument()
    })

    it('renders all form fields', () => {
      renderEmployerForm()

      expect(screen.getByLabelText(/employer name/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/ein/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/address line 1/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/address line 2/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/city/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/state/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/zip code/i)).toBeInTheDocument()
    })

    it('renders Cancel and Add Employer buttons', () => {
      renderEmployerForm()

      expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /add employer/i })).toBeInTheDocument()
    })
  })

  describe('Form validation', () => {
    it('shows error when employer name is empty', async () => {
      const user = userEvent.setup()
      renderEmployerForm()

      await user.click(screen.getByRole('button', { name: /add employer/i }))

      await waitFor(() => {
        expect(screen.getByText(/employer name is required/i)).toBeInTheDocument()
      })
    })

    it('shows error for invalid EIN format', async () => {
      const user = userEvent.setup()
      renderEmployerForm()

      await user.type(screen.getByLabelText(/employer name/i), 'Test Corp')
      // Manually set invalid EIN by typing just digits
      const einInput = screen.getByLabelText(/ein/i)
      await user.type(einInput, '12345')
      await user.click(screen.getByRole('button', { name: /add employer/i }))

      await waitFor(() => {
        expect(screen.getByText(/ein must be in xx-xxxxxxx format/i)).toBeInTheDocument()
      })
    })

    it('shows error for invalid ZIP code format', async () => {
      const user = userEvent.setup()
      renderEmployerForm()

      await user.type(screen.getByLabelText(/employer name/i), 'Test Corp')
      await user.type(screen.getByLabelText(/zip code/i), '123')
      await user.click(screen.getByRole('button', { name: /add employer/i }))

      await waitFor(() => {
        expect(screen.getByText(/zip code must be xxxxx or xxxxx-xxxx/i)).toBeInTheDocument()
      })
    })
  })

  describe('Form submission', () => {
    it('calls API with form data on successful submission', async () => {
      const user = userEvent.setup()
      mockEmployerApi.create.mockResolvedValue({ id: 'new-employer', name: 'Acme Corp' })
      const { onSuccess } = renderEmployerForm()

      await user.type(screen.getByLabelText(/employer name/i), 'Acme Corp')
      await user.click(screen.getByRole('button', { name: /add employer/i }))

      await waitFor(() => {
        expect(mockEmployerApi.create).toHaveBeenCalledWith({
          name: 'Acme Corp',
        })
      })
      expect(onSuccess).toHaveBeenCalled()
    })

    it('shows saving state during submission', async () => {
      const user = userEvent.setup()
      mockEmployerApi.create.mockImplementation(() => new Promise(() => {}))
      renderEmployerForm()

      await user.type(screen.getByLabelText(/employer name/i), 'Acme Corp')
      await user.click(screen.getByRole('button', { name: /add employer/i }))

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /saving/i })).toBeDisabled()
      })
    })

    it('shows error message on API failure', async () => {
      const user = userEvent.setup()
      mockEmployerApi.create.mockRejectedValue(new Error('API Error'))
      renderEmployerForm()

      await user.type(screen.getByLabelText(/employer name/i), 'Acme Corp')
      await user.click(screen.getByRole('button', { name: /add employer/i }))

      await waitFor(() => {
        expect(screen.getByRole('alert')).toBeInTheDocument()
        expect(screen.getByText(/failed to add employer/i)).toBeInTheDocument()
      })
    })
  })

  describe('Modal interactions', () => {
    it('calls onClose when Cancel button is clicked', async () => {
      const user = userEvent.setup()
      const { onClose } = renderEmployerForm()

      await user.click(screen.getByRole('button', { name: /cancel/i }))

      expect(onClose).toHaveBeenCalled()
    })

    it('calls onClose when close button is clicked', async () => {
      const user = userEvent.setup()
      const { onClose } = renderEmployerForm()

      await user.click(screen.getByRole('button', { name: /close dialog/i }))

      expect(onClose).toHaveBeenCalled()
    })

    it('calls onClose when Escape key is pressed', async () => {
      const user = userEvent.setup()
      const { onClose } = renderEmployerForm()

      await user.keyboard('{Escape}')

      expect(onClose).toHaveBeenCalled()
    })
  })

  describe('Accessibility', () => {
    it('has aria-modal attribute', () => {
      renderEmployerForm()

      expect(screen.getByRole('dialog')).toHaveAttribute('aria-modal', 'true')
    })

    it('has aria-labelledby pointing to title', () => {
      renderEmployerForm()

      const dialog = screen.getByRole('dialog')
      const titleId = dialog.getAttribute('aria-labelledby')
      expect(titleId).toBeTruthy()
      expect(document.getElementById(titleId!)).toHaveTextContent(/add employer/i)
    })

    it('focuses first input on open', () => {
      renderEmployerForm()

      expect(screen.getByLabelText(/employer name/i)).toHaveFocus()
    })
  })
})
