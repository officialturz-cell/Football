import { FOOTBALL_DATA_API_KEY, FOOTBALL_DATA_BASE_URL, FOOTBALL_TIMEOUT_MS } from './FootballConfig'
import { FootballProviderError, FootballUnauthorizedError, FootballTimeoutError, FootballRateLimitError } from './FootballError'

async function fetchWithTimeout(url: string, opts: RequestInit = {}, timeout = FOOTBALL_TIMEOUT_MS): Promise<Response> {
  const controller = new AbortController()
  const id = setTimeout(() => controller.abort(), timeout)
  try {
    const res = await fetch(url, { ...opts, signal: controller.signal })
    clearTimeout(id)
    return res
  } catch (err: any) {
    clearTimeout(id)
    if (err.name === 'AbortError') throw new FootballTimeoutError()
    throw new FootballProviderError(String(err))
  }
}

export async function footballFetch(path: string, opts: RequestInit = {}): Promise<Response> {
  const url = path.startsWith('http') ? path : `${FOOTBALL_DATA_BASE_URL}${path}`
  const headers: Record<string, string> = { 'X-Auth-Token': FOOTBALL_DATA_API_KEY }
  if (opts.headers) Object.assign(headers, opts.headers as Record<string, string>)

  const res = await fetchWithTimeout(url, { ...opts, headers })

  if (res.status === 401 || res.status === 403) throw new FootballUnauthorizedError()
  if (res.status === 429) throw new FootballRateLimitError()
  return res
}
