import { describe, it, expect } from 'vitest'

describe('Test Framework Setup', () => {
  it('should be able to run basic tests', () => {
    expect(1 + 1).toBe(2)
  })

  it('should support TypeScript', () => {
    const message: string = 'Hello, Vitest!'
    expect(message).toContain('Vitest')
  })
})