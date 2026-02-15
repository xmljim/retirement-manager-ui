# Phase 1: Contribution Tracking - Design Specification

**File:** `docs/design/PHASE1_CONTRIBUTIONS.md` (in both repos)
**Version:** 1.0
**Status:** Draft

## Overview

Person management, accounts, contribution rules, and projections.

This spec is the source of truth for both repositories:
- `retirement-manager-api` - Java 25 + Spring Boot 4.0 backend
- `retirement-manager-ui` - Vite + React 19 + TypeScript frontend

**Sync Strategy**: OpenAPI spec generated from backend → TypeScript types generated for frontend.

---

## Table of Contents
1. [Domain Entities](#domain-entities)
2. [Contribution Rules](#contribution-rules)
3. [API Endpoints](#api-endpoints)
4. [Frontend Architecture](#frontend-architecture)
5. [FE/BE Sync Strategy](#febe-sync-strategy)
6. [Implementation Plan](#implementation-plan)

---

## Domain Entities

### Person
```
Person
├── id: UUID
├── firstName, lastName
├── dateOfBirth: LocalDate
├── filingStatus: SINGLE | MARRIED_FILING_JOINTLY | MARRIED_FILING_SEPARATELY | HEAD_OF_HOUSEHOLD
├── stateOfResidence: String (2-letter code)
├── marriages: Marriage[] (history of all marriages)
├── incomes: Income[]
└── accounts: Account[]
```

### Marriage (tracks marriage/divorce history for SS benefits)
```
Marriage
├── id: UUID
├── person1: Person
├── person2: Person
├── marriageDate: LocalDate
├── divorceDate: LocalDate? (null if still married)
├── status: MARRIED | DIVORCED | WIDOWED
└── notes: String?
```
**Why track history?** SS spousal benefits require 10+ year marriages for divorced spouse benefits.

### Income
```
Income
├── id: UUID
├── person: Person
├── type: SALARY | SELF_EMPLOYMENT | BONUS | OTHER
├── employment: Employment? (for SALARY type - links to employer)
├── annualAmount: BigDecimal
├── expectedAnnualIncrease: BigDecimal? (e.g., 0.03 = 3% raise/year for projections)
├── payFrequency: WEEKLY | BIWEEKLY | SEMIMONTHLY | MONTHLY | ANNUAL
└── isActive: boolean (derived from employment.isActive for salary)
```

### Employer
```
Employer
├── id: UUID
├── name: String
├── matchingPolicy: MatchingPolicy?
└── planTypes: Set<AccountType> (which account types this employer offers)
```

### Employment (links Person to Employer with dates)
```
Employment
├── id: UUID
├── person: Person
├── employer: Employer
├── startDate: LocalDate
├── endDate: LocalDate? (null if currently employed)
├── isActive: boolean (derived: endDate == null)
└── accounts: Account[] (employer-sponsored accounts from this job)
```

### MatchingPolicy
```
MatchingPolicy
├── id: UUID
├── employer: Employer
├── tiers: MatchTier[] (ordered)
├── maxEmployerMatchPercent: BigDecimal (cap on total employer match, e.g., 0.04 = 4%)
├── vestingSchedule: VestingSchedule
├── hasTrueUp: boolean
└── compensationCap: BigDecimal? (defaults to IRS limit: $350,000 for 2025)
```

### MatchTier
```
MatchTier
├── matchPercent: BigDecimal (employer matches this % of employee contribution)
├── employeeContribFrom: BigDecimal (start of employee contribution range)
├── employeeContribTo: BigDecimal (end of employee contribution range)
└── order: int
```

### VestingSchedule
```
VestingSchedule
├── type: IMMEDIATE | CLIFF | GRADED
├── cliffYears: int? (for CLIFF type)
└── gradedSchedule: Map<Integer, BigDecimal>? (years → vested %)
```

### Account
```
Account
├── id: UUID
├── person: Person (owner - never changes)
├── accountType: AccountType (enum)
├── taxTreatment: TAX_DEFERRED | TAX_FREE | TAXABLE
├── employment: Employment? (for workplace plans, null for personal accounts)
├── contributions: Contribution[]
├── holdings: Holding[] (current asset allocation)
├── openedDate: LocalDate
└── closedDate: LocalDate? (null if open)
```

### Holding (asset allocation within account)
```
Holding
├── id: UUID
├── account: Account
├── assetClass: STOCKS | BONDS | CASH | REAL_ESTATE | COMMODITIES | OTHER
├── percentage: BigDecimal (allocation %, e.g., 0.90 = 90%)
├── currentValue: BigDecimal
└── expectedReturnRate: BigDecimal (annual, e.g., 0.10 = 10%)
```

### AccountSnapshot (point-in-time balance for tracking growth)
```
AccountSnapshot
├── id: UUID
├── account: Account
├── snapshotDate: LocalDate
├── totalBalance: BigDecimal
├── ytdContributions: BigDecimal
├── ytdEmployerMatch: BigDecimal
├── ytdGrowth: BigDecimal (investment returns)
└── holdings: Map<AssetClass, BigDecimal> (allocation at snapshot time)
```

### AccountType (enum)
```
TRADITIONAL_401K    - Tax-deferred, workplace, employer match eligible
ROTH_401K           - Tax-free growth, workplace, employer match eligible
TRADITIONAL_IRA     - Tax-deferred, individual, deductibility rules
ROTH_IRA            - Tax-free growth, individual, income limits
SEP_IRA             - Self-employed, high limits
SIMPLE_IRA          - Small business
HSA                 - Triple tax advantage, HDHP required
403B                - Non-profit workplace
457B                - Government workplace
BROKERAGE           - Taxable, no limits
```

### ContributionElection (ongoing paycheck deduction setup)
```
ContributionElection
├── id: UUID
├── person: Person
├── account: Account
├── contributionPercent: BigDecimal (e.g., 0.10 = 10% of salary)
├── effectiveDate: LocalDate
├── endDate: LocalDate? (null if current)
└── isCatchup: boolean (for catch-up eligible contributions)
```

### Contribution (actual money contributed)
```
Contribution
├── id: UUID
├── account: Account
├── paycheck: Paycheck? (null for lump-sum/rollover)
├── amount: BigDecimal
├── contributionType: EMPLOYEE | EMPLOYER_MATCH | EMPLOYER_NONELECTIVE | CATCHUP | ROLLOVER
└── contributedAt: LocalDate
```

### Paycheck (tracks each pay period)
```
Paycheck
├── id: UUID
├── income: Income
├── payDate: LocalDate
├── grossAmount: BigDecimal
├── contributions: Contribution[] (employee + employer for this paycheck)
└── payPeriodNumber: int (1-24 for semi-monthly, 1-26 for bi-weekly, etc.)
```

---

## Contribution Limits (2025/2026)

### 401(k)/403(b)/457(b) Limits
| Limit Type | 2025 | 2026 |
|------------|------|------|
| Employee Elective Deferral | $23,500 | $24,000 (est.) |
| Catch-up (age 50+) | $7,500 | $7,500 |
| Super Catch-up (age 60-63) | $11,250 | $11,250 |
| Total 415(c) Limit | $70,000 | $71,000 (est.) |
| Compensation Limit | $350,000 | $355,000 (est.) |

### IRA Limits
| Limit Type | 2025 | 2026 |
|------------|------|------|
| Contribution Limit | $7,000 | $7,000 |
| Catch-up (age 50+) | $1,000 | $1,000 |

### HSA Limits
| Coverage Type | 2025 | 2026 |
|---------------|------|------|
| Self-only | $4,300 | $4,400 (est.) |
| Family | $8,550 | $8,750 (est.) |
| Catch-up (age 55+) | $1,000 | $1,000 |

---

## Age-Based Calculations

Age is derived from `Person.dateOfBirth` as of December 31 of the contribution year.

```
getAge(person, year) → age as of Dec 31 of year
isCatchupEligible(person, year) → age >= 50
isSuperCatchupEligible(person, year) → age >= 60 && age <= 63
```

### Catch-up Eligibility by Age
| Age Range | 401k/403b/457b | IRA | HSA |
|-----------|----------------|-----|-----|
| Under 50  | Base only | Base only | Base only |
| 50-54     | +$7,500 catch-up | +$1,000 | - |
| 55-59     | +$7,500 catch-up | +$1,000 | +$1,000 HSA catch-up |
| 60-63     | +$11,250 super catch-up | +$1,000 | +$1,000 HSA |
| 64+       | +$7,500 catch-up | +$1,000 | +$1,000 HSA |

---

## SECURE 2.0 Act Rules

### High Earner Roth Catch-up (Effective 2026)
- Applies to employees earning > $145,000 WAGES in prior year (W-2 wages from THIS employer)
- ALL catch-up contributions MUST be Roth (not traditional)
- Affects 401(k), 403(b), 457(b) plans
- Does NOT affect IRA catch-up contributions

### Super Catch-up (Ages 60-63)
- Higher catch-up limit: $11,250 (vs $7,500 standard)
- Available for ages 60, 61, 62, and 63 only
- Reverts to standard catch-up at age 64

---

## Income Phase-Outs (2025)

### Roth IRA Contribution Phase-out
| Filing Status | Phase-out Starts | Phase-out Ends |
|---------------|------------------|----------------|
| Single/HOH | $150,000 | $165,000 |
| MFJ | $236,000 | $246,000 |
| MFS | $0 | $10,000 |

### Traditional IRA Deduction Phase-out (covered by workplace plan)
| Filing Status | Phase-out Starts | Phase-out Ends |
|---------------|------------------|----------------|
| Single/HOH | $79,000 | $89,000 |
| MFJ (contributor covered) | $126,000 | $146,000 |
| MFJ (spouse covered) | $236,000 | $246,000 |

---

## Database Schema (Flyway Migrations)

### V1: Core Tables
- persons, marriages

### V2: Reference Data
- contribution_limits (year, account_type, limit_type, amount)
- phase_out_ranges (year, filing_status, account_type, magi_start, magi_end)
- high_earner_threshold (year, amount)

---

## API Endpoints

```
# Persons & Relationships
POST   /api/v1/persons                    # Create person
GET    /api/v1/persons/{id}               # Get person with accounts
PUT    /api/v1/persons/{id}               # Update person
POST   /api/v1/persons/{id}/marriages     # Record marriage
PUT    /api/v1/marriages/{id}             # Update (e.g., record divorce)

# Limits & Calculations
GET    /api/v1/limits/{year}               # Get all limit rules for a year
GET    /api/v1/limits/{year}/{accountType} # Get limits for specific account type
```

---

## Frontend Architecture

### Feature Modules (src/features/)
```
features/
├── persons/           # Person profile management
│   ├── PersonForm.tsx
│   ├── PersonDetail.tsx
│   └── MarriageHistory.tsx
└── contributions/     # Contribution tracking
    └── LimitsDisplay.tsx
```

### Shared Components (src/components/)
```
components/
├── forms/             # Form primitives
│   ├── MoneyInput.tsx
│   ├── PercentInput.tsx
│   ├── DatePicker.tsx
│   └── SelectEnum.tsx
└── layout/            # Page layout
    ├── PageHeader.tsx
    ├── Card.tsx
    └── TabNav.tsx
```

---

## FE/BE Sync Strategy

### OpenAPI Type Generation
```bash
# Backend generates OpenAPI spec
./gradlew bootRun  # API at http://localhost:8080/api-docs

# Frontend generates TypeScript types
cd retirement-manager-ui
npm run api:generate  # Generates src/api/schema.d.ts
```

---

## Implementation Plan

### Milestone 1: Reference Data & Person
**Backend:**
- V1 migration: persons, marriages tables
- V2 migration: contribution_limits, phase_out_ranges tables
- Person CRUD endpoints
- Marriage endpoints
- Limits query endpoints

**Frontend:**
- PersonForm, PersonDetail components
- MarriageHistory component
- LimitsDisplay component
- Basic routing and layout

**Deliverable:** Can create persons, view contribution limits by year

---

## Document History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2026-02-14 | Initial spec: Phase 1 Contribution Tracking |
