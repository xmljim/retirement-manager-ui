# CLAUDE.md

This file provides guidance to Claude Code when working with this repository.

## Project Overview

Retirement Manager UI - Vite + React + TypeScript frontend for retirement lifecycle management.

## Build & Run

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Quality Gates

**IMPORTANT:** Run quality gates before committing code changes.

```bash
# Run all quality checks (ESLint, Prettier, Vitest with coverage)
npm run quality

# Or run individual checks:
npm run lint              # ESLint
npm run format:check      # Prettier check
npm run test              # Run tests
npm run test:coverage     # Tests with coverage

# Auto-fix issues:
npm run lint:fix          # Fix ESLint issues
npm run format            # Format with Prettier
npm run quality:fix       # Fix all + run tests
```

Quality thresholds:
- Vitest coverage: Minimum 50% (statements, branches, functions, lines)

## Issue Tracking

This project uses **beads** for issue tracking.

```bash
bd ready              # Find available work
bd show <id>          # View issue details
bd update <id> --status in_progress  # Claim work
bd close <id>         # Complete work
bd sync               # Sync with git
```

## Key Locations

- `src/` - Main source code
  - `api/` - API client and generated types
  - `components/` - Reusable UI components
  - `features/` - Feature-based modules
    - `accounts/` - Account management
    - `contributions/` - Contribution tracking
    - `projections/` - Financial projections
  - `hooks/` - Custom React hooks
  - `types/` - Shared TypeScript types
  - `test/` - Test setup and utilities

## Stack

- **Vite** - Build tool
- **React 19** - UI framework
- **TypeScript** - Type safety
- **TanStack Query** - API state management
- **React Router** - Navigation
- **Tailwind CSS** - Styling
- **Vitest** - Testing framework
- **Prettier** - Code formatting

## API Proxy

Dev server proxies `/api` requests to `http://localhost:8080` (backend).

## Related Repository

Backend: https://github.com/xmljim/retirement-manager-api
