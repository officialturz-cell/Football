import { MatchContext } from '@/context/matchContext'
import { PromptOptions } from '@/prompts/constants'

export function mapToGeminiRequest(prompt: string, opts: Partial<PromptOptions> = {}, model = 'gemini-2.5-pro') {
  // Map generic prompt options into Gemini-compatible request body
  const body: Record<string, any> = {
    model,
    prompt,
    temperature: opts.temperature ?? 0.0,
    top_p: opts.topP ?? 0.9,
    max_tokens: opts.maxTokens ?? 2048,
    // include additional metadata for observability
    metadata: {
      requested_at: new Date().toISOString()
    }
  }

  return body
}
