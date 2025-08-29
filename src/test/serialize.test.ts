import { describe, it, expect } from 'vitest'
import { saveProblemAsString, loadProblemFromString } from '../serialize'
import { defaultProblem } from '../puzzle'

describe('Serialize Functions', () => {
  it('should serialize and deserialize a default problem', () => {
    // Create a default 9x9 problem
    const originalProblem = defaultProblem(9, 3)
    
    // Serialize it to string
    const serialized = saveProblemAsString(originalProblem)
    
    // Verify the serialized string is not empty
    expect(serialized).toBeTruthy()
    expect(typeof serialized).toBe('string')
    
    // Deserialize it back
    const deserializedProblem = loadProblemFromString(serialized)
    
    // Verify key properties are preserved
    expect(deserializedProblem.size).toBe(originalProblem.size)
    expect(deserializedProblem.enabledRules).toEqual(originalProblem.enabledRules)
    expect(deserializedProblem.ruleData).toBeInstanceOf(Map)
  })

  it('should handle invalid problem strings', () => {
    // Test that invalid strings throw errors
    expect(() => loadProblemFromString('invalid-string')).toThrow('Invalid problem string')
    expect(() => loadProblemFromString('')).toThrow()
  })

  it('should create different serialized strings for different problem sizes', () => {
    const problem4x4 = defaultProblem(4, 2)
    const problem9x9 = defaultProblem(9, 3)
    
    const serialized4x4 = saveProblemAsString(problem4x4)
    const serialized9x9 = saveProblemAsString(problem9x9)
    
    // Different sized problems should have different serializations
    expect(serialized4x4).not.toBe(serialized9x9)
    
    // Verify they deserialize to correct sizes
    expect(loadProblemFromString(serialized4x4).size).toBe(4)
    expect(loadProblemFromString(serialized9x9).size).toBe(9)
  })
})