// Core domain types - aligned with backend API

export type FilingStatus = 'SINGLE' | 'MARRIED_FILING_JOINTLY' | 'MARRIED_FILING_SEPARATELY' | 'HEAD_OF_HOUSEHOLD';

export type IncomeType = 'SALARY' | 'BONUS' | 'INTEREST' | 'DIVIDEND' | 'SIDE_INCOME' | 'OTHER';

export type PayFrequency = 'WEEKLY' | 'BIWEEKLY' | 'SEMIMONTHLY' | 'MONTHLY' | 'ANNUALLY';

export type AccountType =
  | 'TRADITIONAL_401K'
  | 'ROTH_401K'
  | 'TRADITIONAL_IRA'
  | 'ROTH_IRA'
  | 'HSA'
  | 'BROKERAGE'
  | 'PENSION';

export interface Person {
  id: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  filingStatus: FilingStatus;
  state?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Income {
  id: string;
  personId: string;
  incomeType: IncomeType;
  sourceName?: string;
  amount: number;
  frequency: PayFrequency;
  createdAt: string;
  updatedAt: string;
}

export interface Account {
  id: string;
  personId: string;
  accountType: AccountType;
  accountName?: string;
  balance: number;
  contributionYtd: number;
  employerName?: string;
  employerMatchPercent?: number;
  employerMatchLimitPercent?: number;
  vestingPercent: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePersonRequest {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  filingStatus: FilingStatus;
  state?: string;
}

export interface CreateAccountRequest {
  accountType: AccountType;
  accountName?: string;
  balance?: number;
  employerName?: string;
  employerMatchPercent?: number;
  employerMatchLimitPercent?: number;
}
