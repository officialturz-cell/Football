import { GEMINI_RATE_LIMIT_PER_MINUTE } from './GeminiConfig'

/**
 * Simple in-memory rate limiter. Not distributed. Suitable for a single-instance dev/test.
 */
export class GeminiRateLimiter {
  private readonly windowMs: number
  private readonly maxRequests: number
  private timestamps: number[] = []

  constructor(maxPerMinute = GEMINI_RATE_LIMIT_PER_MINUTE) {
    this.windowMs = 60_000
    this.maxRequests = maxPerMinute
    this.timestamps = []
  }

  allow(): boolean {
    const now = Date.now()
    // remove timestamps older than window
    this.timestamps = this.timestamps.filter(ts => ts > now - this.windowMs)
    if (this.timestamps.length < this.maxRequests) {
      this.timestamps.push(now)
      return true
    }
    return false
  }

  // for diagnostics
  getUsage(): { windowMs: number; maxRequests: number; current: number } {
    const now = Date.now()
    this.timestamps = this.timestamps.filter(ts => ts > now - this.windowMs)
    return { windowMs: this.windowMs, maxRequests: this.maxRequests, current: this.timestamps.length }
  }
}
