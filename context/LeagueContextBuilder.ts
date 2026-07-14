import { FootballDataProvider } from '@/providers/football'

const provider = new FootballDataProvider()

export type LeagueContext = {
  currentPosition?: number
  gapToLeader?: number
  gapToRelegation?: number
  recentTrend?: 'up' | 'down' | 'stable' | null
  motivationLevel?: 'title' | 'europe' | 'mid_table' | 'relegation' | 'secure' | null
  summary?: string | null
}

export class LeagueContextBuilder {
  private provider = provider

  async buildForTeam(competitionId: string, teamId: string): Promise<LeagueContext | null> {
    try {
      const standings = await this.provider.getStandings(competitionId)
      if (!standings || !standings.standings || !standings.standings[0] || !Array.isArray(standings.standings[0].table)) return null
      const table = standings.standings[0].table as any[]
      const row = table.find(r => String(r.team?.id) === String(teamId))
      if (!row) return null

      const position = row.position
      const leader = table[0]
      const gapToLeader = leader && typeof leader.points === 'number' && typeof row.points === 'number' ? leader.points - row.points : undefined
      // Relegation zone determination: assume bottom 3 relegated for many leagues (cannot invent exact number)
      const relegationSize = Math.max(1, Math.floor(table.length >= 20 ? 3 : 3))
      const relegationThresholdRow = table[table.length - relegationSize]
      const gapToRelegation = relegationThresholdRow && typeof relegationThresholdRow.points === 'number' ? row.points - relegationThresholdRow.points : undefined

      // Recent trend: look at last 5 results if available via team matches
      const recentMatchesResp = await this.provider.getTeamMatches(teamId, { status: 'FINISHED', limit: 5 })
      let recentTrend: 'up' | 'down' | 'stable' | null = null
      if (recentMatchesResp && Array.isArray(recentMatchesResp.matches)) {
        const wins = recentMatchesResp.matches.reduce((acc: number, m: any) => {
          const isHome = String(m.homeTeam?.id) === String(teamId)
          const gf = m.score?.fullTime ? (isHome ? m.score.fullTime.home ?? 0 : m.score.fullTime.away ?? 0) : 0
          const ga = m.score?.fullTime ? (isHome ? m.score.fullTime.away ?? 0 : m.score.fullTime.home ?? 0) : 0
          return acc + (gf > ga ? 1 : 0)
        }, 0)
        if (wins >= 3) recentTrend = 'up'
        else if (wins === 0) recentTrend = 'down'
        else recentTrend = 'stable'
      }

      // Motivation level heuristics (safe defaults):
      // - If position 1 and gapToLeader large -> already champion
      // - If position within top 4 -> title/europe depending
      let motivation: LeagueContext['motivationLevel'] = null
      if (position === 1 && gapToLeader !== undefined && gapToLeader >= 10) motivation = 'secure'
      else if (position === 1) motivation = 'title'
      else if (position <= 4) motivation = 'europe'
      else if (position > table.length - relegationSize) motivation = 'relegation'
      else if (position <= 10) motivation = 'mid_table'
      else motivation = 'mid_table'

      const summary = `Position ${position} of ${table.length}. Gap to leader: ${gapToLeader ?? 'N/A'}. Gap to relegation: ${gapToRelegation ?? 'N/A'}.`

      return {
        currentPosition: position,
        gapToLeader: typeof gapToLeader === 'number' ? gapToLeader : undefined,
        gapToRelegation: typeof gapToRelegation === 'number' ? gapToRelegation : undefined,
        recentTrend,
        motivationLevel: motivation,
        summary
      }
    } catch (err) {
      return null
    }
  }
}

export const leagueContextBuilder = new LeagueContextBuilder()
