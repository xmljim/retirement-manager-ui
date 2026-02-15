# Contributing to Retirement Manager UI

## Quality Standards

### Testing Requirements

**Coverage Target: 60%+ line coverage**

| Component Type | Test Type | Tools |
|----------------|-----------|-------|
| Components | Unit/Integration | Vitest, Testing Library |
| Hooks | Unit | Vitest, renderHook |
| Utils | Unit | Vitest |

Run all tests:
```bash
npm run test
```

### Quality Gate

**Must pass before any PR merge:**

```bash
npm run quality
```

This runs:
- ESLint - Static analysis and style
- Prettier - Code formatting
- Vitest - All tests with coverage

### Code Style

Follow modern React 19 + TypeScript idioms:
- Use functional components only
- Use TypeScript strict mode
- Prefer named exports over default exports
- Use TanStack Query for server state
- Use `const` assertions for literal types
- Destructure props in function signature
- Use `satisfies` for type narrowing where helpful

### Component Guidelines

```typescript
// Good - props destructured, typed
interface PersonFormProps {
  person?: Person;
  onSubmit: (data: CreatePersonRequest) => void;
}

export function PersonForm({ person, onSubmit }: PersonFormProps) {
  // ...
}

// Avoid - default export, any types
export default function PersonForm(props: any) { ... }
```

### PR Review Checklist

Before requesting review:
- [ ] `npm run quality` passes
- [ ] New components have tests
- [ ] Types generated from API (`npm run api:generate`)
- [ ] No TODOs without linked issues
- [ ] Accessible (keyboard nav, ARIA labels)

Reviewer checklist:
- [ ] Code follows modern React/TS idioms
- [ ] Tests are meaningful (not just coverage padding)
- [ ] Components are accessible
- [ ] No security vulnerabilities (XSS, etc.)
- [ ] Types are specific (no `any`)

## Issue Workflow

We use `beads` (bd) for issue tracking:

```bash
# Find available work
bd ready

# Start working on an issue
bd update <id> --status in_progress

# When done
bd close <id>

# Sync changes to git
bd sync
```

### Branch Naming

```
feature/<issue-id>-short-description
bugfix/<issue-id>-short-description
```

Example: `feature/retirement-manager-ui-eoj.1-api-client`

## Getting Help

- Check existing issues: `bd list`
- Ask in PR comments for clarification
- Reference the design spec in `docs/design/`
