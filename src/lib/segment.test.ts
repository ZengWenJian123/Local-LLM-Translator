import { describe, expect, it } from 'vitest'
import { mergeSegments, splitText } from '@/lib/segment'

describe('segment helpers', () => {
  it('splits by paragraph boundaries', () => {
    const input = '第一段\n\n第二段'
    const output = splitText(input, 100)
    expect(output).toEqual(['第一段', '第二段'])
  })

  it('splits oversized text by max length', () => {
    const output = splitText('a'.repeat(11), 5)
    expect(output).toEqual(['aaaaa', 'aaaaa', 'a'])
  })

  it('merges translated segments', () => {
    const output = mergeSegments([' A ', 'B', '', 'C'])
    expect(output).toBe('A\n\nB\n\nC')
  })
})
