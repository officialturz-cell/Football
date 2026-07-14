import { EvidenceImportance } from './EvidenceTypes'

/**
 * Compute importance for a signal embedding.
 * This is a simple heuristic function — can be expanded later.
 */
export function scoreImportance(value: number | string, signalType: 'recent_form' | 'goals' | 'league_position' = 'recent_form'): EvidenceImportance {
  if (signalType === 'league_position') {
    const pos = Number(value)
    if (isNaN(pos)) return EvidenceImportance.MEDIUM
    if (pos === 1) return EvidenceImportance.HIGH
    if (pos <= 4) return EvidenceImportance.HIGH
    if (pos <= 10) return EvidenceImportance.MEDIUM
    return EvidenceImportance.LOW
  }

  if (signalType === 'goals') {
    const g = Number(value)
    if (isNaN(g)) return EvidenceImportance.MEDIUM
    if (g >= 2) return EvidenceImportance.HIGH
    if (g >= 1) return EvidenceImportance.MEDIUM
    return EvidenceImportance.LOW
  }

  // recent_form - numeric ratio expected (0..1)
  const v = typeof value === 'number' ? value : Number(value)
  if (isNaN(v)) return EvidenceImportance.MEDIUM
  if (v >= 0.75) return EvidenceImportance.HIGH
  if (v >= 0.5) return EvidenceImportance.MEDIUM
  return EvidenceImportance.LOW
}

/**
 * Score confidence based on data completeness.
 * e.g. numberOfItems / expectedItems (expected default 5)
 */
export function scoreConfidence(availableItems: number, expectedItems = 5): number {
  if (!availableItems || availableItems <= 0) return 0.0
  const ratio = Math.min(1, availableItems / expectedItems)
  // scale to 0.5..1.0 to avoid overconfidence for tiny data
  return +(0.5 + 0.5 * ratio).toFixed(2)
}
