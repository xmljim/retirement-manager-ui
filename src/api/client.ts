/**
 * API Client
 *
 * Type-safe API client with fetch wrapper and TanStack Query integration.
 * Types are generated from the backend OpenAPI specification.
 */

import type {
  ApiPerson,
  ApiPagePerson,
  ApiAccount,
  ApiMarriage,
  ApiCreatePersonRequest,
  ApiCreateAccountRequest,
  ApiCreateMarriageRequest,
  ApiUpdateMarriageRequest,
  ApiYearlyLimits,
  ApiAccountTypeLimits,
  ApiEmployer,
  ApiPageEmployer,
  ApiCreateEmployerRequest,
  ApiUpdateEmployerRequest,
  ApiEmployment,
  ApiCreateEmploymentRequest,
  ApiUpdateEmploymentRequest,
  ApiEmploymentIncome,
  ApiCreateEmploymentIncomeRequest,
  ApiUpdateEmploymentIncomeRequest,
} from './schema'

// Base configuration
const API_BASE_URL = '/api/v1'

/**
 * API Error class for structured error handling
 */
export class ApiError extends Error {
  status: number
  statusText: string
  data?: unknown

  constructor(message: string, status: number, statusText: string, data?: unknown) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.statusText = statusText
    this.data = data
  }
}

/**
 * Base fetch wrapper with error handling
 */
async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`

  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  })

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    throw new ApiError(
      errorData.message || `Request failed: ${response.status}`,
      response.status,
      response.statusText,
      errorData
    )
  }

  // Handle 204 No Content
  if (response.status === 204) {
    return undefined as T
  }

  return response.json()
}

/**
 * HTTP method helpers
 */
export const api = {
  get: <T>(endpoint: string) => request<T>(endpoint),

  post: <T>(endpoint: string, body: unknown) =>
    request<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(body),
    }),

  put: <T>(endpoint: string, body: unknown) =>
    request<T>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(body),
    }),

  patch: <T>(endpoint: string, body: unknown) =>
    request<T>(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(body),
    }),

  delete: <T>(endpoint: string) => request<T>(endpoint, { method: 'DELETE' }),
}

// ============================================================================
// Type-safe API Methods
// ============================================================================

/**
 * Pagination parameters
 */
export interface PaginationParams {
  page?: number
  size?: number
  sort?: string
}

/**
 * Person API endpoints
 */
export const personApi = {
  /** Get all persons with pagination */
  getAll: (params?: PaginationParams) => {
    const searchParams = new URLSearchParams()
    if (params?.page !== undefined) searchParams.set('page', String(params.page))
    if (params?.size !== undefined) searchParams.set('size', String(params.size))
    if (params?.sort) searchParams.set('sort', params.sort)
    const query = searchParams.toString()
    return api.get<ApiPagePerson>(`/persons${query ? `?${query}` : ''}`)
  },

  /** Get a person by ID */
  getById: (id: string) => api.get<ApiPerson>(`/persons/${id}`),

  /** Create a new person */
  create: (data: ApiCreatePersonRequest) => api.post<ApiPerson>('/persons', data),

  /** Update an existing person */
  update: (id: string, data: ApiCreatePersonRequest) => api.put<ApiPerson>(`/persons/${id}`, data),
}

/**
 * Account API endpoints
 */
export const accountApi = {
  /** Get all accounts for a person */
  getByPersonId: (personId: string) => api.get<ApiAccount[]>(`/persons/${personId}/accounts`),

  /** Create a new account for a person */
  create: (personId: string, data: ApiCreateAccountRequest) =>
    api.post<ApiAccount>(`/persons/${personId}/accounts`, data),
}

/**
 * Marriage API endpoints
 */
export const marriageApi = {
  /** Get all marriages for a person */
  getByPersonId: (personId: string) => api.get<ApiMarriage[]>(`/persons/${personId}/marriages`),

  /** Get a marriage by ID */
  getById: (id: string) => api.get<ApiMarriage>(`/marriages/${id}`),

  /** Create a new marriage for a person */
  create: (personId: string, data: ApiCreateMarriageRequest) =>
    api.post<ApiMarriage>(`/persons/${personId}/marriages`, data),

  /** Update an existing marriage */
  update: (id: string, data: ApiUpdateMarriageRequest) =>
    api.put<ApiMarriage>(`/marriages/${id}`, data),
}

/**
 * Contribution Limits API endpoints
 */
export const limitsApi = {
  /** Get all limits for a year */
  getByYear: (year: number) => api.get<ApiYearlyLimits>(`/limits/${year}`),

  /** Get limits for a specific account type and year */
  getByYearAndAccountType: (year: number, accountType: string) =>
    api.get<ApiAccountTypeLimits>(`/limits/${year}/${accountType}`),

  /** Get available years */
  getAvailableYears: () => api.get<number[]>('/limits/years'),
}

/**
 * Employer API endpoints
 */
export const employerApi = {
  /** Get all employers with pagination */
  getAll: (params?: PaginationParams) => {
    const searchParams = new URLSearchParams()
    if (params?.page !== undefined) searchParams.set('page', String(params.page))
    if (params?.size !== undefined) searchParams.set('size', String(params.size))
    if (params?.sort) searchParams.set('sort', params.sort)
    const query = searchParams.toString()
    return api.get<ApiPageEmployer>(`/employers${query ? `?${query}` : ''}`)
  },

  /** Get an employer by ID */
  getById: (id: string) => api.get<ApiEmployer>(`/employers/${id}`),

  /** Search employers by name */
  searchByName: (name: string) =>
    api.get<ApiEmployer[]>(`/employers/search?name=${encodeURIComponent(name)}`),

  /** Create a new employer */
  create: (data: ApiCreateEmployerRequest) => api.post<ApiEmployer>('/employers', data),

  /** Update an existing employer */
  update: (id: string, data: ApiUpdateEmployerRequest) =>
    api.put<ApiEmployer>(`/employers/${id}`, data),

  /** Delete an employer */
  delete: (id: string) => api.delete<void>(`/employers/${id}`),
}

/**
 * Employment API endpoints
 */
export const employmentApi = {
  /** Get an employment by ID */
  getById: (id: string) => api.get<ApiEmployment>(`/employment/${id}`),

  /** Get all employment for a person */
  getByPersonId: (personId: string) => api.get<ApiEmployment[]>(`/employment?personId=${personId}`),

  /** Get current employment for a person */
  getCurrentByPersonId: (personId: string) =>
    api.get<ApiEmployment[]>(`/employment/current?personId=${personId}`),

  /** Create a new employment record */
  create: (data: ApiCreateEmploymentRequest) => api.post<ApiEmployment>('/employment', data),

  /** Update an existing employment record */
  update: (id: string, data: ApiUpdateEmploymentRequest) =>
    api.put<ApiEmployment>(`/employment/${id}`, data),

  /** Delete an employment record */
  delete: (id: string) => api.delete<void>(`/employment/${id}`),
}

/**
 * Employment Income API endpoints
 */
export const employmentIncomeApi = {
  /** Get an income record by ID */
  getById: (id: string) => api.get<ApiEmploymentIncome>(`/income/${id}`),

  /** Get all income records for an employment */
  getByEmploymentId: (employmentId: string) =>
    api.get<ApiEmploymentIncome[]>(`/income/employment/${employmentId}`),

  /** Get all income records for a person */
  getByPersonId: (personId: string) => api.get<ApiEmploymentIncome[]>(`/income/person/${personId}`),

  /** Get all income records for a person in a specific year */
  getByPersonIdAndYear: (personId: string, year: number) =>
    api.get<ApiEmploymentIncome[]>(`/income/person/${personId}/year/${year}`),

  /** Create a new income record */
  create: (data: ApiCreateEmploymentIncomeRequest) =>
    api.post<ApiEmploymentIncome>('/income', data),

  /** Update an existing income record */
  update: (id: string, data: ApiUpdateEmploymentIncomeRequest) =>
    api.put<ApiEmploymentIncome>(`/income/${id}`, data),

  /** Delete an income record */
  delete: (id: string) => api.delete<void>(`/income/${id}`),
}

// ============================================================================
// TanStack Query Keys
// Consistent query key factory for cache management
// ============================================================================

export const queryKeys = {
  persons: {
    all: ['persons'] as const,
    detail: (id: string) => ['persons', id] as const,
  },
  accounts: {
    byPerson: (personId: string) => ['accounts', 'byPerson', personId] as const,
  },
  marriages: {
    byPerson: (personId: string) => ['marriages', 'byPerson', personId] as const,
  },
  limits: {
    byYear: (year: number) => ['limits', 'byYear', year] as const,
    byYearAndType: (year: number, accountType: string) =>
      ['limits', 'byYear', year, accountType] as const,
    availableYears: ['limits', 'years'] as const,
  },
  employers: {
    all: ['employers'] as const,
    detail: (id: string) => ['employers', id] as const,
    search: (name: string) => ['employers', 'search', name] as const,
  },
  employment: {
    detail: (id: string) => ['employment', id] as const,
    byPerson: (personId: string) => ['employment', 'byPerson', personId] as const,
    currentByPerson: (personId: string) => ['employment', 'current', 'byPerson', personId] as const,
  },
  employmentIncome: {
    detail: (id: string) => ['income', id] as const,
    byEmployment: (employmentId: string) => ['income', 'byEmployment', employmentId] as const,
    byPerson: (personId: string) => ['income', 'byPerson', personId] as const,
    byPersonAndYear: (personId: string, year: number) =>
      ['income', 'byPerson', personId, 'year', year] as const,
  },
}
