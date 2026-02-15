import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AddMarriageForm } from './AddMarriageForm'
import * as api from '../../api/client'

vi.mock('../../api/client', async () => {
  const actual = await vi.importActual('../../api/client')
  return {
    ...actual,
    marriageApi: {
      create: vi.fn(),
    },
  }
})

const mockMarriageApi = api.marriageApi as {
  create: ReturnType<typeof vi.fn>
}

function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  })
}

function renderAddMarriageForm(props = {}) {
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
        <AddMarriageForm {...mergedProps} />
      </QueryClientProvider>
    ),
    onClose: mergedProps.onClose,
    onSuccess: mergedProps.onSuccess,
  }
}

describe('AddMarriageForm', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Rendering', () => {
    it('renders dialog with title', () => {
      renderAddMarriageForm()

      expect(screen.getByRole('dialog')).toBeInTheDocument()
      expect(screen.getByRole('heading', { name: /add marriage/i })).toBeInTheDocument()
    })

    it('renders all form fields', () => {
      renderAddMarriageForm()

      expect(screen.getByLabelText(/spouse first name/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/spouse last name/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/marriage date/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/status/i)).toBeInTheDocument()
    })

    it('renders Cancel and Save buttons', () => {
      renderAddMarriageForm()

      expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /save marriage/i })).toBeInTheDocument()
    })

    it('renders close button', () => {
      renderAddMarriageForm()

      expect(screen.getByRole('button', { name: /close dialog/i })).toBeInTheDocument()
    })
  })

  describe('Form validation', () => {
    it('shows error when first name is empty', async () => {
      const user = userEvent.setup()
      renderAddMarriageForm()

      await user.click(screen.getByRole('button', { name: /save marriage/i }))

      await waitFor(() => {
        expect(screen.getByText(/first name is required/i)).toBeInTheDocument()
      })
    })

    it('shows error when last name is empty', async () => {
      const user = userEvent.setup()
      renderAddMarriageForm()

      await user.type(screen.getByLabelText(/spouse first name/i), 'Sarah')
      await user.click(screen.getByRole('button', { name: /save marriage/i }))

      await waitFor(() => {
        expect(screen.getByText(/last name is required/i)).toBeInTheDocument()
      })
    })

    it('shows error when marriage date is empty', async () => {
      const user = userEvent.setup()
      renderAddMarriageForm()

      await user.type(screen.getByLabelText(/spouse first name/i), 'Sarah')
      await user.type(screen.getByLabelText(/spouse last name/i), 'Johnson')
      await user.click(screen.getByRole('button', { name: /save marriage/i }))

      await waitFor(() => {
        expect(screen.getByText(/marriage date is required/i)).toBeInTheDocument()
      })
    })
  })

  describe('End date field visibility', () => {
    it('does not show end date field when status is Married', () => {
      renderAddMarriageForm()

      expect(screen.queryByLabelText(/end date/i)).not.toBeInTheDocument()
    })

    it('shows end date field when status is Divorced', async () => {
      const user = userEvent.setup()
      renderAddMarriageForm()

      await user.selectOptions(screen.getByLabelText(/status/i), 'DIVORCED')

      expect(screen.getByLabelText(/end date/i)).toBeInTheDocument()
    })

    it('shows end date field when status is Widowed', async () => {
      const user = userEvent.setup()
      renderAddMarriageForm()

      await user.selectOptions(screen.getByLabelText(/status/i), 'WIDOWED')

      expect(screen.getByLabelText(/end date/i)).toBeInTheDocument()
    })
  })

  describe('Form submission', () => {
    it('calls API with form data on successful submission', async () => {
      const user = userEvent.setup()
      mockMarriageApi.create.mockResolvedValue({ id: 'new-marriage' })
      const { onSuccess } = renderAddMarriageForm()

      await user.type(screen.getByLabelText(/spouse first name/i), 'Sarah')
      await user.type(screen.getByLabelText(/spouse last name/i), 'Johnson')
      await user.type(screen.getByLabelText(/marriage date/i), '2010-06-15')
      await user.click(screen.getByRole('button', { name: /save marriage/i }))

      await waitFor(() => {
        expect(mockMarriageApi.create).toHaveBeenCalledWith('123', {
          spouseFirstName: 'Sarah',
          spouseLastName: 'Johnson',
          marriageDate: '2010-06-15',
          status: 'MARRIED',
        })
      })
      expect(onSuccess).toHaveBeenCalled()
    })

    it('includes end date for divorced status', async () => {
      const user = userEvent.setup()
      mockMarriageApi.create.mockResolvedValue({ id: 'new-marriage' })
      renderAddMarriageForm()

      await user.type(screen.getByLabelText(/spouse first name/i), 'Emily')
      await user.type(screen.getByLabelText(/spouse last name/i), 'Davis')
      await user.type(screen.getByLabelText(/marriage date/i), '2002-03-20')
      await user.selectOptions(screen.getByLabelText(/status/i), 'DIVORCED')
      await user.type(screen.getByLabelText(/end date/i), '2008-12-10')
      await user.click(screen.getByRole('button', { name: /save marriage/i }))

      await waitFor(() => {
        expect(mockMarriageApi.create).toHaveBeenCalledWith('123', {
          spouseFirstName: 'Emily',
          spouseLastName: 'Davis',
          marriageDate: '2002-03-20',
          endDate: '2008-12-10',
          status: 'DIVORCED',
        })
      })
    })

    it('shows saving state during submission', async () => {
      const user = userEvent.setup()
      mockMarriageApi.create.mockImplementation(() => new Promise(() => {}))
      renderAddMarriageForm()

      await user.type(screen.getByLabelText(/spouse first name/i), 'Sarah')
      await user.type(screen.getByLabelText(/spouse last name/i), 'Johnson')
      await user.type(screen.getByLabelText(/marriage date/i), '2010-06-15')
      await user.click(screen.getByRole('button', { name: /save marriage/i }))

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /saving/i })).toBeDisabled()
      })
    })

    it('shows error message on API failure', async () => {
      const user = userEvent.setup()
      mockMarriageApi.create.mockRejectedValue(new Error('API Error'))
      renderAddMarriageForm()

      await user.type(screen.getByLabelText(/spouse first name/i), 'Sarah')
      await user.type(screen.getByLabelText(/spouse last name/i), 'Johnson')
      await user.type(screen.getByLabelText(/marriage date/i), '2010-06-15')
      await user.click(screen.getByRole('button', { name: /save marriage/i }))

      await waitFor(() => {
        expect(screen.getByRole('alert')).toBeInTheDocument()
        expect(screen.getByText(/failed to add marriage/i)).toBeInTheDocument()
      })
    })
  })

  describe('Modal interactions', () => {
    it('calls onClose when Cancel button is clicked', async () => {
      const user = userEvent.setup()
      const { onClose } = renderAddMarriageForm()

      await user.click(screen.getByRole('button', { name: /cancel/i }))

      expect(onClose).toHaveBeenCalled()
    })

    it('calls onClose when close button is clicked', async () => {
      const user = userEvent.setup()
      const { onClose } = renderAddMarriageForm()

      await user.click(screen.getByRole('button', { name: /close dialog/i }))

      expect(onClose).toHaveBeenCalled()
    })

    it('calls onClose when Escape key is pressed', async () => {
      const user = userEvent.setup()
      const { onClose } = renderAddMarriageForm()

      await user.keyboard('{Escape}')

      expect(onClose).toHaveBeenCalled()
    })

    it('does not close when clicking inside dialog', async () => {
      const user = userEvent.setup()
      const { onClose } = renderAddMarriageForm()

      // Click inside the dialog content
      await user.click(screen.getByLabelText(/spouse first name/i))

      expect(onClose).not.toHaveBeenCalled()
    })
  })

  describe('Accessibility', () => {
    it('has aria-modal attribute', () => {
      renderAddMarriageForm()

      expect(screen.getByRole('dialog')).toHaveAttribute('aria-modal', 'true')
    })

    it('has aria-labelledby pointing to title', () => {
      renderAddMarriageForm()

      const dialog = screen.getByRole('dialog')
      const titleId = dialog.getAttribute('aria-labelledby')
      expect(titleId).toBeTruthy()
      expect(document.getElementById(titleId!)).toHaveTextContent(/add marriage/i)
    })

    it('focuses first input on open', () => {
      renderAddMarriageForm()

      expect(screen.getByLabelText(/spouse first name/i)).toHaveFocus()
    })
  })
})
