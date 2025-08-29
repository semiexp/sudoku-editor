import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import React from 'react'

// Simple test component
const TestComponent: React.FC<{ message: string }> = ({ message }) => {
  return <div data-testid="test-message">{message}</div>
}

describe('React Testing Library Setup', () => {
  it('should render React components', () => {
    render(<TestComponent message="Hello, React Testing Library!" />)
    
    const messageElement = screen.getByTestId('test-message')
    expect(messageElement).toBeInTheDocument()
    expect(messageElement).toHaveTextContent('Hello, React Testing Library!')
  })

  it('should support React component props', () => {
    const testMessage = 'Test message for props'
    render(<TestComponent message={testMessage} />)
    
    expect(screen.getByText(testMessage)).toBeInTheDocument()
  })
})