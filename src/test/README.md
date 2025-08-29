# Testing Setup

This project uses [Vitest](https://vitest.dev/) as the test framework along with [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/) for component testing.

## Test Framework Features

- **Vitest**: Fast test runner designed for Vite projects
- **React Testing Library**: Testing utilities for React components
- **Jest DOM**: Custom Jest matchers for DOM testing
- **TypeScript Support**: Full TypeScript support for tests
- **JSDoc Environment**: Browser-like environment for testing DOM interactions

## Running Tests

```bash
# Run tests once
npm run test:run

# Run tests in watch mode (re-runs on file changes)
npm test

# Run tests with UI (if @vitest/ui is installed)
npm run test:ui
```

## Test Structure

Tests are located in the `src/test/` directory and should follow the naming convention:
- `*.test.ts` for TypeScript tests
- `*.test.tsx` for React component tests

## Writing Tests

### Basic Tests
```typescript
import { describe, it, expect } from 'vitest'

describe('My Feature', () => {
  it('should work as expected', () => {
    expect(1 + 1).toBe(2)
  })
})
```

### React Component Tests
```typescript
import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import MyComponent from '../components/MyComponent'

describe('MyComponent', () => {
  it('should render correctly', () => {
    render(<MyComponent />)
    expect(screen.getByText('Hello')).toBeInTheDocument()
  })
})
```

## Configuration

- **Vitest Config**: Defined in `vite.config.ts`
- **Test Setup**: `src/test/setup.ts` (automatically loaded)
- **TypeScript**: Tests are included in `tsconfig.app.json`

## Adding New Tests

1. Create test files in `src/test/` or alongside your source files
2. Use the `.test.ts` or `.test.tsx` extension
3. Import necessary testing utilities
4. Write your tests using Vitest's Jest-compatible API

## Best Practices

- Test behavior, not implementation details
- Use `data-testid` attributes for reliable element selection
- Keep tests simple and focused
- Use descriptive test names that explain what is being tested