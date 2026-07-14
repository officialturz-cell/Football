export const FOOTBALL_DATA_BASE_URL = process.env.FOOTBALL_DATA_BASE_URL ?? 'https://api.football-data.org/v4'
export const FOOTBALL_DATA_API_KEY = process.env.FOOTBALL_DATA_API_KEY ?? ''
export const FOOTBALL_TIMEOUT_MS = Number(process.env.FOOTBALL_TIMEOUT_MS ?? 10_000)
export const FOOTBALL_MAX_RETRIES = Number(process.env.FOOTBALL_MAX_RETRIES ?? 2)
export const FOOTBALL_CACHE_TTL_MS = Number(process.env.FOOTBALL_CACHE_TTL_MS ?? 1000 * 60 * 5) // 5 minutes
