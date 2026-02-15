/**
 * OpenAPI Schema Types
 *
 * This file contains placeholder types that will be regenerated from the API's
 * OpenAPI specification when running:
 *   npm run api:generate       (from running API)
 *   npm run api:generate:file  (from local openapi.json)
 *
 * These types are aligned with the retirement-manager-api backend.
 */

export interface paths {
  '/api/v1/persons': {
    get: {
      responses: {
        200: {
          content: {
            'application/json': components['schemas']['Person'][]
          }
        }
      }
    }
    post: {
      requestBody: {
        content: {
          'application/json': components['schemas']['CreatePersonRequest']
        }
      }
      responses: {
        201: {
          content: {
            'application/json': components['schemas']['Person']
          }
        }
      }
    }
  }
  '/api/v1/persons/{id}': {
    get: {
      parameters: {
        path: {
          id: string
        }
      }
      responses: {
        200: {
          content: {
            'application/json': components['schemas']['Person']
          }
        }
      }
    }
    put: {
      parameters: {
        path: {
          id: string
        }
      }
      requestBody: {
        content: {
          'application/json': components['schemas']['CreatePersonRequest']
        }
      }
      responses: {
        200: {
          content: {
            'application/json': components['schemas']['Person']
          }
        }
      }
    }
  }
  '/api/v1/persons/{id}/accounts': {
    get: {
      parameters: {
        path: {
          id: string
        }
      }
      responses: {
        200: {
          content: {
            'application/json': components['schemas']['Account'][]
          }
        }
      }
    }
    post: {
      parameters: {
        path: {
          id: string
        }
      }
      requestBody: {
        content: {
          'application/json': components['schemas']['CreateAccountRequest']
        }
      }
      responses: {
        201: {
          content: {
            'application/json': components['schemas']['Account']
          }
        }
      }
    }
  }
  '/api/v1/persons/{personId}/contribution-limits': {
    get: {
      parameters: {
        path: {
          personId: string
        }
      }
      responses: {
        200: {
          content: {
            'application/json': components['schemas']['ContributionLimits']
          }
        }
      }
    }
  }
}

export interface components {
  schemas: {
    FilingStatus:
      | 'SINGLE'
      | 'MARRIED_FILING_JOINTLY'
      | 'MARRIED_FILING_SEPARATELY'
      | 'HEAD_OF_HOUSEHOLD'

    IncomeType: 'SALARY' | 'BONUS' | 'INTEREST' | 'DIVIDEND' | 'SIDE_INCOME' | 'OTHER'

    PayFrequency: 'WEEKLY' | 'BIWEEKLY' | 'SEMIMONTHLY' | 'MONTHLY' | 'ANNUALLY'

    MarriageStatus: 'MARRIED' | 'DIVORCED' | 'WIDOWED' | 'ANNULLED'

    AccountType:
      | 'TRADITIONAL_401K'
      | 'ROTH_401K'
      | 'TRADITIONAL_IRA'
      | 'ROTH_IRA'
      | 'HSA'
      | 'BROKERAGE'
      | 'PENSION'

    Person: {
      id: string
      firstName: string
      lastName: string
      dateOfBirth: string
      filingStatus: components['schemas']['FilingStatus']
      state?: string
      createdAt: string
      updatedAt: string
    }

    Income: {
      id: string
      personId: string
      incomeType: components['schemas']['IncomeType']
      sourceName?: string
      amount: number
      frequency: components['schemas']['PayFrequency']
      createdAt: string
      updatedAt: string
    }

    Account: {
      id: string
      personId: string
      accountType: components['schemas']['AccountType']
      accountName?: string
      balance: number
      contributionYtd: number
      employerName?: string
      employerMatchPercent?: number
      employerMatchLimitPercent?: number
      vestingPercent: number
      createdAt: string
      updatedAt: string
    }

    CreatePersonRequest: {
      firstName: string
      lastName: string
      dateOfBirth: string
      filingStatus: components['schemas']['FilingStatus']
      state?: string
    }

    CreateAccountRequest: {
      accountType: components['schemas']['AccountType']
      accountName?: string
      balance?: number
      employerName?: string
      employerMatchPercent?: number
      employerMatchLimitPercent?: number
    }

    ContributionLimits: {
      year: number
      traditional401kLimit: number
      roth401kLimit: number
      catchUp401kLimit: number
      traditionalIraLimit: number
      rothIraLimit: number
      catchUpIraLimit: number
      hsaIndividualLimit: number
      hsaFamilyLimit: number
      catchUpHsaLimit: number
    }

    Marriage: {
      id: string
      personId: string
      spouseFirstName: string
      spouseLastName: string
      marriageDate: string
      endDate?: string
      status: components['schemas']['MarriageStatus']
      createdAt: string
      updatedAt: string
    }

    CreateMarriageRequest: {
      spouseFirstName: string
      spouseLastName: string
      marriageDate: string
      endDate?: string
      status: components['schemas']['MarriageStatus']
    }
  }
}

// Operations will be populated by openapi-typescript when regenerated
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface operations {}

export type ApiPerson = components['schemas']['Person']
export type ApiAccount = components['schemas']['Account']
export type ApiIncome = components['schemas']['Income']
export type ApiMarriage = components['schemas']['Marriage']
export type ApiMarriageStatus = components['schemas']['MarriageStatus']
export type ApiCreatePersonRequest = components['schemas']['CreatePersonRequest']
export type ApiCreateAccountRequest = components['schemas']['CreateAccountRequest']
export type ApiCreateMarriageRequest = components['schemas']['CreateMarriageRequest']
export type ApiContributionLimits = components['schemas']['ContributionLimits']
