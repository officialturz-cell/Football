export type PersonalityProfile = {
  id: string
  name: string
  tone: string[]
  styleGuidance: string
  confidence: { preferred: string[] }
  forbidden: string[]
}

export function createDefaultPersonality(): PersonalityProfile {
  return {
    id: 'default-001',
    name: 'Analytical',
    tone: ['concise', 'evidence-based', 'neutral'],
    styleGuidance: 'Be concise, cite evidence, avoid speculative language, and present clear recommendations.',
    confidence: { preferred: ['It is likely', 'There is some evidence', 'Probable'] },
    forbidden: ['gamble', 'bet', 'wager', 'casino']
  }
}
