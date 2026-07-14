import { Evidence, EvidenceCategory, EvidenceImportance } from '@/evidence/EvidenceTypes'
import { DecisionPack, DecisionSignal } from './DecisionTypes'
import { rankEvidence } from '@/evidence/EvidenceRanking'

function toSignal(e: Evidence): DecisionSignal {
  return {
    id: e.id,
    category: e.category,
    importance: e.importance,
    confidence: e.confidence,
    description: e.description
  }
}

function containsAny(text: string, list: string[]) {
  const t = text.toLowerCase()
  return list.some(k => t.includes(k))
}

/**
 * Heuristic polarity classifier. Conservative rules: only classify as positive/negative when clear keywords present.
 */
function classifyPolarity(e: Evidence): 'positive' | 'negative' | 'neutral' {
  const desc = e.description.toLowerCase()
  const positiveKeywords = ['win', 'unbeaten', 'averaging', 'kept', 'clean sheet', 'on a', 'in contention', 'motivation']
  const negativeKeywords = ['failed to score', 'missing', 'injury', 'relegation', 'risk', 'lose', 'lost', 'relegation']

  if (containsAny(desc, positiveKeywords)) return 'positive'
  if (containsAny(desc, negativeKeywords)) return 'negative'
  return 'neutral'
}

/**
 * Assign drivers categories conservatively based on evidence category and keywords
 */
function classifyDriver(e: Evidence): 'tactical' | 'momentum' | 'league' | 'other' {
  if (e.category === EvidenceCategory.RECENT_FORM) return 'momentum'
  if (e.category === EvidenceCategory.HEAD_TO_HEAD) return 'tactical'
  if (e.category === EvidenceCategory.LEAGUE) return 'league'
  if (e.category === EvidenceCategory.LINEUP) return 'tactical'
  if (e.category === EvidenceCategory.STATISTICS) return 'tactical'
  return 'other'
}

/**
 * Compute an aggregate overall confidence from signals
 */
function aggregateConfidence(signals: DecisionSignal[]): number {
  if (!signals || signals.length === 0) return 0
  const sum = signals.reduce((s, x) => s + Math.max(0, Math.min(1, x.confidence)), 0)
  return +(sum / signals.length).toFixed(2)
}

/**
 * Build DecisionPack from ranked Evidence array. Conservative: do not expose details, only descriptions.
 */
export function buildDecisionPack(evidence: Evidence[], maxTop = 10): DecisionPack {
  const ranked = rankEvidence(evidence)
  const topEvidence = ranked.slice(0, maxTop)
  const topSignals = topEvidence.map(toSignal)

  const positiveFactors: DecisionSignal[] = []
  const negativeFactors: DecisionSignal[] = []
  const riskFactors: DecisionSignal[] = []
  const unknownFactors: DecisionSignal[] = []
  const missingInformation: string[] = []
  const confidenceDrivers: DecisionSignal[] = []
  const tacticalDrivers: DecisionSignal[] = []
  const momentumDrivers: DecisionSignal[] = []
  const leagueDrivers: DecisionSignal[] = []

  for (const e of topEvidence) {
    const signal = toSignal(e)
    const polarity = classifyPolarity(e)
    const driver = classifyDriver(e)

    // missing information detection
    if (e.description.toLowerCase().includes('missing') || e.description.toLowerCase().includes('not confirmed')) {
      missingInformation.push(e.description)
      riskFactors.push(signal)
      continue
    }

    // risk indicators
    if (e.importance === EvidenceImportance.CRITICAL && e.confidence < 0.6) {
      riskFactors.push(signal)
    }

    // polarity
    if (polarity === 'positive') positiveFactors.push(signal)
    else if (polarity === 'negative') negativeFactors.push(signal)
    else unknownFactors.push(signal)

    // drivers
    const drv = classifyDriver(e)
    if (drv === 'tactical') tacticalDrivers.push(signal)
    if (drv === 'momentum') momentumDrivers.push(signal)
    if (drv === 'league') leagueDrivers.push(signal)

    // confidence drivers: high-importance high-confidence signals
    if ((e.importance === EvidenceImportance.CRITICAL || e.importance === EvidenceImportance.HIGH) && e.confidence >= 0.8) {
      confidenceDrivers.push(signal)
    }
  }

  // overall confidence derived from top signals
  const overallConfidence = aggregateConfidence(topSignals)

  // Build a short decision summary (max 250 words) by combining top signals' descriptions conservatively
  const summarySentences = topSignals.slice(0, 6).map(s => s.description)
  let decisionSummary = summarySentences.join(' ')
  if (decisionSummary.length > 2000) {
    decisionSummary = decisionSummary.slice(0, 2000)
  }

  const pack: DecisionPack = {
    topSignals,
    positiveFactors,
    negativeFactors,
    riskFactors,
    unknownFactors,
    missingInformation: Array.from(new Set(missingInformation)),
    confidenceDrivers,
    tacticalDrivers,
    momentumDrivers,
    leagueDrivers,
    decisionSummary,
    overallConfidence
  }

  return pack
}
