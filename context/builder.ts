import { FootballDataProvider } from '@/providers/football'
import { MatchContext } from '@/context/matchContext'

const provider = new FootballDataProvider()

/**
 * ContextBuilder builds a MatchContext using the FootballDataProvider and normalizes
 * fields into the application's internal MatchContext shape. If a field is unavailable
 * from the provider, the value is left undefined/null per requirements.
 */
export class ContextBuilder {
  async build(matchId: string): Promise<MatchContext> {
    const match = await provider.getMatch(matchId)
    if (!match) throw new Error('Match not found')

    // competition
    const competitionId = match.competition?.id ?? match.competition?.area?.id ?? null
    const competition = competitionId ? await provider.getCompetition(String(competitionId)) : null

    // teams
    const homeTeamId = match.homeTeam?.id ?? (match.homeTeam && match.homeTeam.id)
    const awayTeamId = match.awayTeam?.id ?? (match.awayTeam && match.awayTeam.id)
    const home = homeTeamId ? await provider.getTeam(String(homeTeamId)) : undefined
    const away = awayTeamId ? await provider.getTeam(String(awayTeamId)) : undefined

    // standings
    let standings = undefined
    if (competition?.id) {
      const s = await provider.getStandings(String(competition.id))
      standings = s ?? undefined
    }

    // recent form - football-data.org doesn't provide a ready-made recent form endpoint; we return null
    const recentForm = undefined

    // statistics - may not be present; set null if not available
    const statistics = match?.score ?? undefined

    // lineups, injuries, timeline, playerRatings - football-data.org v4 provides limited match events; try to map events
    const timeline = (match?.matchday || match?.events) ? (match?.events ?? null) : undefined

    const normalized: MatchContext = {
      match: {
        id: String(match.id ?? match.matchId ?? matchId),
        status: match.status?.toUpperCase ? match.status.toUpperCase() : (match.status ?? 'SCHEDULED'),
        kickoff: match.utcDate ?? match.matchDate ?? undefined
      } as any,
      competition: competition
        ? {
            id: competition.id,
            name: competition.name ?? competition.competitionName ?? undefined
          }
        : undefined,
      teams: {
        home: home
          ? { id: home.id, name: home.name ?? home.shortName ?? home.tla ?? undefined }
          : { id: homeTeamId ?? 'home', name: match.homeTeam?.name ?? 'Home' } as any,
        away: away
          ? { id: away.id, name: away.name ?? away.shortName ?? away.tla ?? undefined }
          : { id: awayTeamId ?? 'away', name: match.awayTeam?.name ?? 'Away' } as any
      },
      standings: standings
        ? {
            competitionId: competition?.id ? String(competition.id) : String(competitionId),
            table:
              standings.standings && Array.isArray(standings.standings) && standings.standings[0] && standings.standings[0].table
                ? standings.standings[0].table.map((row: any, idx: number) => ({
                    position: row.position,
                    teamId: row.team?.id,
                    teamName: row.team?.name,
                    played: row.playedGames,
                    won: row.won,
                    drawn: row.draw,
                    lost: row.lost,
                    goalsFor: row.goalsFor,
                    goalsAgainst: row.goalsAgainst,
                    goalDifference: row.goalDifference,
                    points: row.points
                  }))
                : undefined
          }
        : undefined,
      recentForm: undefined,
      statistics: statistics ? { score: statistics } : undefined,
      lineups: undefined,
      injuries: undefined,
      timeline: timeline ? (timeline as any) : undefined,
      playerRatings: undefined,
      referee: match?.referees && match.referees.length ? { name: match.referees[0].name } : undefined,
      venue: match?.venue ? { name: match.venue } : undefined,
      weather: undefined,
      analysisHistory: undefined
    }

    return normalized
  }
}

export const contextBuilder = new ContextBuilder()
