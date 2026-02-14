#!/usr/bin/env bash
# Pre-commit quality checks for retirement-manager-ui
# Runs fast checks: lint + format check on staged files

set -e

echo "Running pre-commit quality checks..."

# Get the project root
PROJECT_ROOT="$(git rev-parse --show-toplevel)"
cd "$PROJECT_ROOT"

# Run TypeScript compile check
echo "  Type checking..."
npx tsc --noEmit

# Run ESLint
echo "  Running ESLint..."
npm run lint --silent

# Run Prettier check
echo "  Checking formatting..."
npm run format:check --silent

echo "Pre-commit checks passed!"
