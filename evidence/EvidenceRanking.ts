import { Evidence, EvidenceImportance } from './EvidenceTypes'

export function rankEvidence(evidence: Evidence[]): Evidence[] {
  const priority = {
    [EvidenceImportance.CRITICAL]: 0,
    [EvidenceImportance.HIGH]: 1,
    [EvidenceImportance.MEDIUM]: 2,
    [EvidenceImportance.LOW]: 3
  }

  return evidence
    .slice()
    .sort((a, b) => {
      const p = priority[a.importance] - priority[b.importance]
      if (p !== 0) return p
      // tie-breaker: higher confidence first
      return b.confidence - a.confidence
    })
}

export function groupByImportance(evidence: Evidence[]) {
  const groups: Record<string, Evidence[]> = {
    critical: [],
    high: [],
    medium: [],
    low: []
  }
  for (const e of evidence) groups[e.importance].push(e)
  return groups
}
