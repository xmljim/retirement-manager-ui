#!/usr/bin/env bash
# Pre-push quality checks for retirement-manager-ui
# Runs full quality gate: lint, format, tests with coverage

set -e

echo "Running pre-push quality gate..."

# Get the project root
PROJECT_ROOT="$(git rev-parse --show-toplevel)"
cd "$PROJECT_ROOT"

# Run full quality gate
echo "  Running full quality gate (lint + format + tests)..."
npm run quality --silent

echo "Pre-push quality gate passed!"
