import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { BrowserRouter } from 'react-router'
import App from './App'

describe('App', () => {
  it('renders the header', () => {
    render(
      <BrowserRouter>
        <App />
      </BrowserRouter>
    )

    expect(screen.getByText('Retirement Manager')).toBeInTheDocument()
  })

  it('renders the welcome message', () => {
    render(
      <BrowserRouter>
        <App />
      </BrowserRouter>
    )

    expect(screen.getByText('Welcome to Retirement Manager')).toBeInTheDocument()
  })
})
