export const GEMINI_DEFAULT_MODEL = process.env.GEMINI_MODEL ?? 'gemini-2.5-pro'
export const GEMINI_API_KEY = process.env.GEMINI_API_KEY ?? ''
export const GEMINI_BASE_URL = process.env.GEMINI_BASE_URL ?? 'https://api.gemini.example/v1'

export const GEMINI_TIMEOUT_MS = Number(process.env.GEMINI_TIMEOUT_MS ?? 30_000)
export const GEMINI_MAX_RETRIES = Number(process.env.GEMINI_MAX_RETRIES ?? 3)
export const GEMINI_RATE_LIMIT_PER_MINUTE = Number(process.env.GEMINI_RATE_LIMIT_PER_MINUTE ?? 120) // default 120 requests/min
