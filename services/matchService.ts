import { Match } from '@/types'

// Stubbed provider that will later be replaced by real football data providers.
// For now it returns an empty array and documentation-friendly types.
export const fetchMatches = async (): Promise<Match[]> => {
  // TODO: implement provider wiring (providers/football/*) and caching.
  return []
}

export const fetchMatchById = async (id: string): Promise<Match | null> => {
  // TODO: implement
  return null
}
