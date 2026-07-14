import { footballFetch } from './FootballMapper'
import { FOOTBALL_MAX_RETRIES } from './FootballConfig'
import { FootballProviderError } from './FootballError'

async function withRetries<T>(fn: () => Promise<T>, max = FOOTBALL_MAX_RETRIES): Promise<T> {
  let attempt = 0
  let lastErr: unknown
  while (attempt <= max) {
    try {
      return await fn()
    } catch (err) {
      lastErr = err
      attempt++
      // Only retry on 5xx or network errors - footballFetch already throws special errors for 401/429
      await new Promise(res => setTimeout(res, Math.min(500 * 2 ** attempt, 2000)))
    }
  }
  throw new FootballProviderError('Max retries exceeded', 'RETRY_EXCEEDED')
}

export async function getJson(path: string) {
  return withRetries(async () => {
    const res = await footballFetch(path)
    const text = await res.text()
    try {
      return text ? JSON.parse(text) : null
    } catch (err) {
      throw new FootballProviderError('Invalid JSON from football provider')
    }
  })
}
