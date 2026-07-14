export type EvidenceId = string

export enum EvidenceCategory {
  RECENT_FORM = 'recent_form',
  HEAD_TO_HEAD = 'head_to_head',
  LEAGUE = 'league',
  LINEUP = 'lineup',
  STATISTICS = 'statistics',
  REFEREE = 'referee',
  VENUE = 'venue',
  WEATHER = 'weather',
  OTHER = 'other'
}

export enum EvidenceImportance {
  CRITICAL = 'critical',
  HIGH = 'high',
  MEDIUM = 'medium',
  LOW = 'low'
}

export type Evidence = {
  id: EvidenceId
  category: EvidenceCategory
  importance: EvidenceImportance
  confidence: number // 0..1 representing how confident we are in this evidence (data completeness)
  description: string // human readable concise evidence statement
  details?: Record<string, unknown> // raw values used to derive the evidence (for audit only)
}

export type EvidenceSummary = {
  topEvidence: Evidence[] // top N most important evidence items
  allEvidenceCount: number
}
