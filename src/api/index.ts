/**
 * API module exports
 *
 * Re-exports all API client functionality and types for convenient importing:
 * import { personApi, queryKeys, ApiError } from '@/api'
 */

export { api, personApi, accountApi, marriageApi, limitsApi, queryKeys, ApiError } from './client'

export type {
  ApiPerson,
  ApiAccount,
  ApiIncome,
  ApiMarriage,
  ApiMarriageStatus,
  ApiCreatePersonRequest,
  ApiCreateAccountRequest,
  ApiCreateMarriageRequest,
  ApiContributionLimits,
} from './schema'
