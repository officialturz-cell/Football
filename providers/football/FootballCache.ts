type CacheEntry<T> = { value: T; expiresAt: number }

export class FootballCache {
  private map = new Map<string, CacheEntry<any>>()
  private ttlMs: number

  constructor(ttlMs = 1000 * 60 * 5) {
    this.ttlMs = ttlMs
  }

  get<T>(key: string): T | null {
    const entry = this.map.get(key)
    if (!entry) return null
    if (Date.now() > entry.expiresAt) {
      this.map.delete(key)
      return null
    }
    return entry.value as T
  }

  set<T>(key: string, value: T) {
    this.map.set(key, { value, expiresAt: Date.now() + this.ttlMs })
  }

  del(key: string) {
    this.map.delete(key)
  }

  clear() {
    this.map.clear()
  }
}
