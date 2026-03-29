import type { Language, TargetLanguage } from '@/types/core'

const LABELS: Record<Language, string> = {
  auto: '自动检测',
  zh: '中文',
  en: '英文',
  ru: '俄语',
}

export function languageLabel(language: Language | TargetLanguage): string {
  return LABELS[language]
}

export function previewText(text: string, length = 80): string {
  const normalized = text.replace(/\s+/g, ' ').trim()
  if (normalized.length <= length) return normalized
  return `${normalized.slice(0, length)}...`
}
