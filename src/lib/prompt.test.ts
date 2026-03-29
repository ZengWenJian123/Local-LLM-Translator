import { describe, expect, it } from 'vitest'
import { buildPrompt } from '@/lib/prompt'

describe('buildPrompt', () => {
  it('includes target language and constraints', () => {
    const prompt = buildPrompt('hello', {
      targetLanguage: 'zh',
      keepTerminologyConsistency: true,
      bilingual: false,
    })
    expect(prompt).toContain('翻译为中文')
    expect(prompt).toContain('保持术语一致')
    expect(prompt).toContain('仅输出译文')
  })
})
