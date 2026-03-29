import { describe, expect, it } from 'vitest'
import { AppError, normalizeErrorMessage } from '@/lib/errors'

describe('normalizeErrorMessage', () => {
  it('returns custom app error text', () => {
    expect(normalizeErrorMessage(new AppError('自定义错误'))).toBe('自定义错误')
  })

  it('returns default text for empty errors', () => {
    expect(normalizeErrorMessage(undefined)).toBe('发生未知错误')
  })

  it('handles regular Error objects', () => {
    expect(normalizeErrorMessage(new Error('boom'))).toBe('boom')
  })
})
