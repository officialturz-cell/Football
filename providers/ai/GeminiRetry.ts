import { ProviderError, RateLimitError, TimeoutError } from './GeminiError'

export const shouldRetryForStatus = (status: number): boolean => {
  return status === 429 || status === 500 || status === 503
}

export async function withRetries<T>(fn: () => Promise<T>, maxAttempts = 3, onRetry?: (attempt: number, err: unknown) => void): Promise<T> {
  let attempt = 0
  let lastError: unknown = null
  while (attempt < maxAttempts) {
    try {
      return await fn()
    } catch (err) {
      attempt++
      lastError = err
      // If it's a provider error we may decide to retry only for specific codes
      if (err instanceof ProviderError) {
        if (err instanceof TimeoutError) {
          // permitted to retry
        } else {
          // other ProviderError types - propagate
        }
      }
      if (onRetry) onRetry(attempt, err)
      // simple exponential backoff
      const backoff = Math.min(1000 * 2 ** attempt, 10_000)
      await new Promise(r => setTimeout(r, backoff))
    }
  }
  throw lastError
}
