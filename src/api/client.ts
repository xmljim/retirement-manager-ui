/**
 * API Client
 *
 * Type-safe API client with fetch wrapper and TanStack Query integration.
 * Types are generated from the backend OpenAPI specification.
 */

import type {
  ApiPerson,
  ApiAccount,
  ApiMarriage,
  ApiCreatePersonRequest,
  ApiCreateAccountRequest,
  ApiCreateMarriageRequest,
  ApiContributionLimits,
} from './schema'

// Base configuration
const API_BASE_URL = '/api/v1'

/**
 * API Error class for structured error handling
 */
export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public statusText: string,
    public data?: unknown
  ) {
    super(message)
    this.name = 'ApiError'
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
 * Person API endpoints
 */
export const personApi = {
  /** Get all persons */
  getAll: () => api.get<ApiPerson[]>('/persons'),

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

  /** Create a new marriage for a person */
  create: (personId: string, data: ApiCreateMarriageRequest) =>
    api.post<ApiMarriage>(`/persons/${personId}/marriages`, data),

  /** Update an existing marriage */
  update: (personId: string, marriageId: string, data: ApiCreateMarriageRequest) =>
    api.put<ApiMarriage>(`/persons/${personId}/marriages/${marriageId}`, data),

  /** Delete a marriage */
  delete: (personId: string, marriageId: string) =>
    api.delete<void>(`/persons/${personId}/marriages/${marriageId}`),
}

/**
 * Contribution Limits API endpoints
 */
export const limitsApi = {
  /** Get contribution limits for a person */
  getByPersonId: (personId: string) =>
    api.get<ApiContributionLimits>(`/persons/${personId}/contribution-limits`),
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
    byPerson: (personId: string) => ['limits', 'byPerson', personId] as const,
    byYear: (year: number) => ['limits', 'byYear', year] as const,
  },
}
