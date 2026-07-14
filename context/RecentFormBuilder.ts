import { FootballDataProvider } from '@/providers/football'
import { RecentFormItem } from '@/context/matchContext'

const provider = new FootballDataProvider()

export class RecentFormBuilder {
  private provider = provider

  async buildForTeam(teamId: string, limit = 5): Promise<RecentFormItem[] | null> {
    // football-data.org teams endpoint supports /teams/{id}/matches?status=FINISHED&limit={}
    try {
      const data = await this.provider.getTeamMatches(teamId, { status: 'FINISHED', limit })
      if (!data || !Array.isArray(data.matches)) return null
      const matches = data.matches as any[]
      const items: RecentFormItem[] = matches.slice(0, limit).map(m => {
        // determine opponent and score relative to team
        const isHome = String(m.homeTeam?.id) === String(teamId) || (m.homeTeam?.id === undefined && m.homeTeam?.name && m.homeTeam?.name === m.homeTeam?.name)
        const opponent = isHome ? m.awayTeam?.name ?? 'Unknown' : m.homeTeam?.name ?? 'Unknown'
        const fullScore = m.score && m.score.fullTime ? `${m.score.fullTime.home ?? 0}-${m.score.fullTime.away ?? 0}` : '0-0'
        const teamGoals = m.score && m.score.fullTime ? (isHome ? m.score.fullTime.home ?? 0 : m.score.fullTime.away ?? 0) : 0
        const oppGoals = m.score && m.score.fullTime ? (isHome ? m.score.fullTime.away ?? 0 : m.score.fullTime.home ?? 0) : 0
        let result: 'W' | 'D' | 'L' = 'D'
        if (teamGoals > oppGoals) result = 'W'
        else if (teamGoals < oppGoals) result = 'L'
        return {
          date: m.utcDate ?? m.matchDate ?? '',
          opponent,
          score: fullScore,
          result
        }
      })
      return items
    } catch (err) {
      return null
    }
  }
}

export const recentFormBuilder = new RecentFormBuilder()
