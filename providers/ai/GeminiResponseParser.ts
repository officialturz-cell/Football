/**
 * Response parser utilities
 * - strip markdown/code fences
 * - extract the first JSON-like object
 * - attempt to recover malformed JSON by balancing braces
 */

import { InvalidJSONError } from './GeminiError'

export const stripCodeFences = (text: string): string => {
  return text.replace(/```[\s\S]*?```/g, '').replace(/`([^`]+)`/g, '$1')
}

export const stripMarkdown = (text: string): string => {
  // remove headings and emphasis but keep content
  return text.replace(/^#+\s+/gm, '').replace(/\*\*(.*?)\*\*/g, '$1').replace(/\*(.*?)\*/g, '$1')
}

export const extractFirstJson = (text: string): string | null => {
  const start = text.indexOf('{')
  if (start === -1) return null
  let depth = 0
  for (let i = start; i < text.length; i++) {
    const ch = text[i]
    if (ch === '{') depth++
    else if (ch === '}') depth--
    if (depth === 0) {
      return text.slice(start, i + 1)
    }
  }
  // no balanced JSON found
  return null
}

export const tryParseJson = (raw: string): unknown => {
  try {
    return JSON.parse(raw)
  } catch (err) {
    // try to recover by extracting the first JSON-like block
    const candidate = extractFirstJson(raw)
    if (!candidate) throw new InvalidJSONError('No JSON object found in response', raw)
    try {
      return JSON.parse(candidate)
    } catch (err2) {
      // last attempt: remove trailing commas and common issues
      const cleaned = candidate.replace(/,\s*}/g, '}').replace(/,\s*]/g, ']')
      try {
        return JSON.parse(cleaned)
      } catch (err3) {
        throw new InvalidJSONError('Failed to recover JSON from response', raw)
      }
    }
  }
}
