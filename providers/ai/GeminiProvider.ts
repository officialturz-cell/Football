import { GeminiRateLimiter } from './GeminiRateLimiter'
import { GEMINI_BASE_URL, GEMINI_API_KEY, GEMINI_DEFAULT_MODEL, GEMINI_TIMEOUT_MS, GEMINI_MAX_RETRIES } from './GeminiConfig'
import { withRetries } from './GeminiRetry'
import { mapToGeminiRequest } from './GeminiMapper'
import { stripCodeFences, stripMarkdown, tryParseJson } from './GeminiResponseParser'
import { ProviderError, RateLimitError, TimeoutError, InvalidJSONError, UnauthorizedError } from './GeminiError'
import { AIResponse, AIProvider } from './index'
import { MatchContext } from '@/context/matchContext'
import { PromptOptions } from '@/prompts/constants'
import { estimateTokens } from '@/prompts/preview'

import crypto from 'crypto'

const limiter = new GeminiRateLimiter()

export class GeminiProvider implements AIProvider {
  private model: string
  private apiKey: string
  private baseUrl: string
  private timeoutMs: number
  private maxRetries: number

  constructor(config?: { model?: string; apiKey?: string; baseUrl?: string; timeoutMs?: number; maxRetries?: number }) {
    this.model = config?.model ?? GEMINI_DEFAULT_MODEL
    this.apiKey = config?.apiKey ?? GEMINI_API_KEY
    this.baseUrl = config?.baseUrl ?? GEMINI_BASE_URL
    this.timeoutMs = config?.timeoutMs ?? GEMINI_TIMEOUT_MS
    this.maxRetries = config?.maxRetries ?? GEMINI_MAX_RETRIES

    if (!this.apiKey) {
      // warn but do not throw — health checks will surface unauthorized errors
      console.warn('GeminiProvider: GEMINI_API_KEY not set')
    }
  }

  async generate(prompt: string, context?: MatchContext, options?: { stream?: boolean; promptOptions?: Partial<PromptOptions>; promptVersion?: string; strategy?: string }): Promise<AIResponse> {
    // Rate limiting
    if (!limiter.allow()) {
      throw new RateLimitError()
    }

    const requestId = crypto.randomUUID?.() ?? `${Date.now()}-${Math.floor(Math.random() * 10000)}`
    const model = this.model
    const body = mapToGeminiRequest(prompt, options?.promptOptions ?? {}, model)
    const url = `${this.baseUrl}/generate`

    const start = Date.now()

    const doFetch = async () => {
      const controller = new AbortController()
      const id = setTimeout(() => controller.abort(), this.timeoutMs)
      try {
        const res = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${this.apiKey}`
          },
          body: JSON.stringify(body),
          signal: controller.signal
        })
        clearTimeout(id)

        const elapsed = Date.now() - start

        if (res.status === 401 || res.status === 403) {
          throw new UnauthorizedError()
        }

        if (res.status >= 500 || res.status === 429 || res.status === 503) {
          const text = await res.text().catch(() => '')
          const err = new ProviderError(`Provider returned status ${res.status}`, String(res.status))
          ;(err as any).responseText = text
          throw err
        }

        const text = await res.text()

        // Logging (do not log API key)
        const estimatedTokens = estimateTokens(text)
        console.info(JSON.stringify({ requestId, model, promptVersion: options?.promptVersion, strategy: options?.strategy, responseTimeMs: elapsed, estimatedTokens }))

        // Try to parse JSON out of response
        const stripped = stripMarkdown(stripCodeFences(text))
        let parsed: unknown | null = null
        try {
          parsed = tryParseJson(stripped)
        } catch (err) {
          // we don't fail here — return raw and let downstream JSONValidator handle it
          parsed = null
        }

        const aiResp: AIResponse = { raw: text, provider: 'gemini', model, parsed }
        return aiResp
      } catch (err: any) {
        if (err?.name === 'AbortError') {
          throw new TimeoutError()
        }
        throw err
      }
    }

    // Retry wrapper: retry on transient errors
    try {
      const result = await withRetries(doFetch, this.maxRetries, (attempt, err) => {
        console.warn(`GeminiProvider retry attempt ${attempt} due to ${String(err)}`)
      })
      return result as AIResponse
    } catch (err: any) {
      // classify common network/status errors
      if (err instanceof RateLimitError) throw err
      if (err instanceof UnauthorizedError) throw err
      if (err instanceof TimeoutError) throw err
      // map generic provider errors
      throw new ProviderError(err?.message ?? 'Unknown provider error')
    }
  }

  // Placeholder for future streaming interface
  async continueChat(_conversationId: string, _input: string): Promise<AIResponse> {
    // For now just throw until implemented
    throw new ProviderError('continueChat is not implemented yet')
  }

  async healthCheck(): Promise<{ status: 'healthy' | 'degraded' | 'offline'; details?: any }> {
    // Lightweight health check: ensure API key present, and test rate limiter
    if (!this.apiKey) return { status: 'offline', details: 'No API key configured' }
    // Optionally ping base url /health if available
    try {
      const controller = new AbortController()
      const id = setTimeout(() => controller.abort(), 3_000)
      const res = await fetch(`${this.baseUrl}/healthcheck`, { method: 'GET', headers: { Authorization: `Bearer ${this.apiKey}` }, signal: controller.signal }).catch(() => null)
      clearTimeout(id)
      if (!res) return { status: 'degraded', details: 'No response from health endpoint' }
      if (res.status >= 200 && res.status < 300) return { status: 'healthy' }
      if (res.status === 401) return { status: 'offline', details: 'Unauthorized' }
      return { status: 'degraded', details: `status ${res.status}` }
    } catch (err) {
      return { status: 'degraded', details: String(err) }
    }
  }
}
