import { DecisionPack, DecisionSignal } from './DecisionTypes'

export function summarizeDecisionPack(pack: DecisionPack, maxSignals = 10) {
  const top = pack.topSignals.slice(0, maxSignals).map(s => `• ${s.description}`)
  return {
    topSignalsText: top.join('\n'),
    decisionSummary: pack.decisionSummary,
    overallConfidence: pack.overallConfidence
  }
}
