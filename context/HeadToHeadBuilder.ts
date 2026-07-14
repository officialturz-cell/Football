import { FootballDataProvider } from '@/providers/football'
import { RecentFormItem } from '@/context/matchContext'

const provider = new FootballDataProvider()

export type HeadToHeadStats = {
  meetings: RecentFormItem[]
  homeWins: number
  awayWins: number
  draws: number
  goalsFor: number
  goalsAgainst: number
  btts: number
  over25: number
  under25: number
  averageGoals: number
}

export class HeadToHeadBuilder {
  private provider = provider

  async build(teamAId: string, teamBId: string, limit = 5): Promise<HeadToHeadStats | null> {
    // We'll fetch recent finished matches and filter for matches where both teams played
    try {
      // fetch recent matches globally (limit to 200 to be safe)
      const allMatches = await this.provider.getMatches()
      if (!allMatches || !Array.isArray(allMatches)) return null
      const relevant = allMatches.filter((m: any) => {
        const home = String(m.homeTeam?.id)
        const away = String(m.awayTeam?.id)
        return (home === String(teamAId) && away === String(teamBId)) || (home === String(teamBId) && away === String(teamAId))
      })

      const meetings = relevant.slice(0, limit).map((m: any) => {
        const isHome = String(m.homeTeam?.id) === String(teamAId)
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

      let homeWins = 0
      let awayWins = 0
      let draws = 0
      let goalsFor = 0
      let goalsAgainst = 0
      let btts = 0
      let over25 = 0

      meetings.forEach(me => {
        const [a, b] = me.score.split('-').map(n => parseInt(n, 10) || 0)
        goalsFor += a
        goalsAgainst += b
        if (a > b) homeWins += 1
        else if (a < b) awayWins += 1
        else draws += 1
        if (a > 0 && b > 0) btts += 1
        if (a + b > 2) over25 += 1
      })

      const averageGoals = meetings.length ? (goalsFor + goalsAgainst) / meetings.length : 0

      return {
        meetings,
        homeWins,
        awayWins,
        draws,
        goalsFor,
        goalsAgainst,
        btts,
        over25,
        under25: meetings.length ? meetings.length - over25 : 0,
        averageGoals
      }
    } catch (err) {
      return null
    }
  }
}

export const headToHeadBuilder = new HeadToHeadBuilder()
