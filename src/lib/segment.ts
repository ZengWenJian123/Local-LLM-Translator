import { MAX_SEGMENT_LENGTH } from '@/lib/defaults'

export function splitText(text: string, maxLength = MAX_SEGMENT_LENGTH): string[] {
  const normalized = text.trim()
  if (!normalized) return []

  const roughParagraphs = normalized
    .split(/\n{2,}/g)
    .map((p) => p.trim())
    .filter(Boolean)

  const segments: string[] = []
  for (const paragraph of roughParagraphs) {
    if (paragraph.length <= maxLength) {
      segments.push(paragraph)
      continue
    }

    let cursor = 0
    while (cursor < paragraph.length) {
      const slice = paragraph.slice(cursor, cursor + maxLength)
      segments.push(slice)
      cursor += maxLength
    }
  }

  return segments
}

export function mergeSegments(parts: string[]): string {
  return parts.map((part) => part.trim()).filter(Boolean).join('\n\n')
}
