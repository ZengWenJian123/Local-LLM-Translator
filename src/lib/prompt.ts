import type { TargetLanguage } from '@/types/core'

const LANGUAGE_MAP: Record<TargetLanguage, string> = {
  zh: '中文',
  en: '英文',
  ru: '俄语',
}

interface BuildPromptOptions {
  targetLanguage: TargetLanguage
  keepTerminologyConsistency: boolean
  bilingual: boolean
}

export function buildPrompt(text: string, options: BuildPromptOptions): string {
  const terminologyLine = options.keepTerminologyConsistency
    ? '2. 保持术语一致。'
    : '2. 优先自然表达。'
  const outputLine = options.bilingual
    ? '4. 以“原文+译文”双语形式输出。'
    : '4. 仅输出译文，不要额外解释。'

  return [
    `请将以下内容翻译为${LANGUAGE_MAP[options.targetLanguage]}。`,
    '要求：',
    '1. 保持原意准确。',
    terminologyLine,
    '3. 保持语句自然通顺。',
    outputLine,
    '文本：',
    text,
  ].join('\n')
}
