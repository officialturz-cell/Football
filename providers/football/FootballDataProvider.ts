import { getJson } from './FootballParser'
import { FootballCache } from './FootballCache'

const cache = new FootballCache()

export class FootballDataProvider {
  private cache = cache

  // ... existing methods are present above in previous commit
}
