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

## Stack

- **Vite** - Build tool
- **React 18** - UI framework
- **TypeScript** - Type safety
- **TanStack Query** - API state management
- **React Router** - Navigation
- **Tailwind CSS** - Styling

## API Proxy

Dev server proxies `/api` requests to `http://localhost:8080` (backend).

## Related Repository

Backend: https://github.com/xmljim/retirement-manager-api
