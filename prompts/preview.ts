export type PromptPreview = {
  finalPrompt: string
  length: number
  estimatedTokens: number
  modulesUsed?: string[]
  trimmedContextSummary?: string
}

export function estimateTokens(text: string): number {
  if (!text) return 0
  // crude token estimate: average 0.75 tokens per word
  const words = text.trim().split(/\s+/).length
  return Math.max(1, Math.floor(words * 0.75))
}
