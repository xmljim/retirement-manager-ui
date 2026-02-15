import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { api, ApiError, personApi, accountApi, limitsApi, queryKeys } from './client'

// Mock fetch globally
const mockFetch = vi.fn()
global.fetch = mockFetch

describe('API Client', () => {
  beforeEach(() => {
    mockFetch.mockReset()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('api helper methods', () => {
    it('makes GET requests correctly', async () => {
      const mockData = { id: '1', name: 'Test' }
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve(mockData),
      })

      const result = await api.get('/test')

      expect(mockFetch).toHaveBeenCalledWith('/api/v1/test', {
        headers: {
          'Content-Type': 'application/json',
        },
      })
      expect(result).toEqual(mockData)
    })

    it('makes POST requests correctly', async () => {
      const requestBody = { name: 'New Item' }
      const mockResponse = { id: '1', name: 'New Item' }
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 201,
        json: () => Promise.resolve(mockResponse),
      })

      const result = await api.post('/test', requestBody)

      expect(mockFetch).toHaveBeenCalledWith('/api/v1/test', {
        method: 'POST',
        body: JSON.stringify(requestBody),
        headers: {
          'Content-Type': 'application/json',
        },
      })
      expect(result).toEqual(mockResponse)
    })

    it('makes PUT requests correctly', async () => {
      const requestBody = { name: 'Updated Item' }
      const mockResponse = { id: '1', name: 'Updated Item' }
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve(mockResponse),
      })

      const result = await api.put('/test/1', requestBody)

      expect(mockFetch).toHaveBeenCalledWith('/api/v1/test/1', {
        method: 'PUT',
        body: JSON.stringify(requestBody),
        headers: {
          'Content-Type': 'application/json',
        },
      })
      expect(result).toEqual(mockResponse)
    })

    it('makes DELETE requests correctly', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 204,
        json: () => Promise.resolve(undefined),
      })

      const result = await api.delete('/test/1')

      expect(mockFetch).toHaveBeenCalledWith('/api/v1/test/1', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      })
      expect(result).toBeUndefined()
    })

    it('handles 204 No Content responses', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 204,
      })

      const result = await api.delete('/test/1')

      expect(result).toBeUndefined()
    })
  })

  describe('error handling', () => {
    it('throws ApiError on non-ok response', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found',
        json: () => Promise.resolve({ message: 'Resource not found' }),
      })

      await expect(api.get('/test/999')).rejects.toThrow(ApiError)
    })

    it('includes error details in ApiError', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        statusText: 'Bad Request',
        json: () => Promise.resolve({ message: 'Invalid input', errors: ['field required'] }),
      })

      try {
        await api.post('/test', {})
        expect.fail('Should have thrown')
      } catch (error) {
        expect(error).toBeInstanceOf(ApiError)
        const apiError = error as ApiError
        expect(apiError.status).toBe(400)
        expect(apiError.statusText).toBe('Bad Request')
        expect(apiError.message).toBe('Invalid input')
        expect(apiError.data).toEqual({ message: 'Invalid input', errors: ['field required'] })
      }
    })

    it('handles non-JSON error responses', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        json: () => Promise.reject(new Error('Invalid JSON')),
      })

      await expect(api.get('/test')).rejects.toThrow('Request failed: 500')
    })
  })

  describe('personApi', () => {
    it('getAll fetches all persons', async () => {
      const mockPersons = [{ id: '1', firstName: 'John' }]
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve(mockPersons),
      })

      const result = await personApi.getAll()

      expect(mockFetch).toHaveBeenCalledWith(
        '/api/v1/persons',
        expect.objectContaining({
          headers: { 'Content-Type': 'application/json' },
        })
      )
      expect(result).toEqual(mockPersons)
    })

    it('getById fetches a single person', async () => {
      const mockPerson = { id: '123', firstName: 'Jane' }
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve(mockPerson),
      })

      const result = await personApi.getById('123')

      expect(mockFetch).toHaveBeenCalledWith(
        '/api/v1/persons/123',
        expect.objectContaining({
          headers: { 'Content-Type': 'application/json' },
        })
      )
      expect(result).toEqual(mockPerson)
    })

    it('create posts new person data', async () => {
      const newPerson = {
        firstName: 'New',
        lastName: 'Person',
        dateOfBirth: '1990-01-01',
        filingStatus: 'SINGLE' as const,
      }
      const createdPerson = { id: '456', ...newPerson }
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 201,
        json: () => Promise.resolve(createdPerson),
      })

      const result = await personApi.create(newPerson)

      expect(mockFetch).toHaveBeenCalledWith(
        '/api/v1/persons',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(newPerson),
        })
      )
      expect(result).toEqual(createdPerson)
    })
  })

  describe('accountApi', () => {
    it('getByPersonId fetches accounts for a person', async () => {
      const mockAccounts = [{ id: 'acc1', accountType: 'TRADITIONAL_401K' }]
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve(mockAccounts),
      })

      const result = await accountApi.getByPersonId('person123')

      expect(mockFetch).toHaveBeenCalledWith(
        '/api/v1/persons/person123/accounts',
        expect.objectContaining({
          headers: { 'Content-Type': 'application/json' },
        })
      )
      expect(result).toEqual(mockAccounts)
    })

    it('create posts new account data', async () => {
      const newAccount = {
        accountType: 'ROTH_IRA' as const,
        accountName: 'My Roth IRA',
        balance: 10000,
      }
      const createdAccount = { id: 'acc789', personId: 'person123', ...newAccount }
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 201,
        json: () => Promise.resolve(createdAccount),
      })

      const result = await accountApi.create('person123', newAccount)

      expect(mockFetch).toHaveBeenCalledWith(
        '/api/v1/persons/person123/accounts',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(newAccount),
        })
      )
      expect(result).toEqual(createdAccount)
    })
  })

  describe('limitsApi', () => {
    it('getByPersonId fetches contribution limits', async () => {
      const mockLimits = {
        year: 2025,
        traditional401kLimit: 23500,
        roth401kLimit: 23500,
      }
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve(mockLimits),
      })

      const result = await limitsApi.getByPersonId('person123')

      expect(mockFetch).toHaveBeenCalledWith(
        '/api/v1/persons/person123/contribution-limits',
        expect.objectContaining({
          headers: { 'Content-Type': 'application/json' },
        })
      )
      expect(result).toEqual(mockLimits)
    })
  })

  describe('queryKeys', () => {
    it('generates correct person query keys', () => {
      expect(queryKeys.persons.all).toEqual(['persons'])
      expect(queryKeys.persons.detail('abc')).toEqual(['persons', 'abc'])
    })

    it('generates correct account query keys', () => {
      expect(queryKeys.accounts.byPerson('xyz')).toEqual(['accounts', 'byPerson', 'xyz'])
    })

    it('generates correct limits query keys', () => {
      expect(queryKeys.limits.byPerson('123')).toEqual(['limits', 'byPerson', '123'])
    })
  })
})
