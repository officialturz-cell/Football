import { Evidence, EvidenceCategory, EvidenceImportance } from '@/evidence/EvidenceTypes'

export type DecisionSignal = {
  id: string
  category: EvidenceCategory
  importance: EvidenceImportance
  confidence: number
  description: string
}

export type DecisionPack = {
  topSignals: DecisionSignal[]
  positiveFactors: DecisionSignal[]
  negativeFactors: DecisionSignal[]
  riskFactors: DecisionSignal[]
  unknownFactors: DecisionSignal[]
  missingInformation: string[]
  confidenceDrivers: DecisionSignal[]
  tacticalDrivers: DecisionSignal[]
  momentumDrivers: DecisionSignal[]
  leagueDrivers: DecisionSignal[]
  decisionSummary: string
  overallConfidence: number // 0..1
}
