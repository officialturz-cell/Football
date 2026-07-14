import { Evidence, EvidenceSummary } from './EvidenceTypes'
import { rankEvidence } from './EvidenceRanking'

export function summarizeEvidence(evidence: Evidence[], topN = 10): EvidenceSummary {
  const ranked = rankEvidence(evidence)
  const top = ranked.slice(0, topN)
  return { topEvidence: top, allEvidenceCount: evidence.length }
}
