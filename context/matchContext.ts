/**
 * MatchContext is the central normalized representation of all match-related information
 * collected from various providers and builders. This is used by context builders,
 * evidence builders, decision builders, and analysis modules.
 */

export type RecentFormItem = {
  date: string
  opponent: string
  score: string // format: "home-away"
  result: 'W' | 'D' | 'L'
}

export type TeamInfo = {
  id: string | number
  name: string
  shortName?: string
  logo?: string
}

export type CompetitionInfo = {
  id: string | number
  name: string
  country?: string
}

export type StandingsRow = {
  position: number
  teamId: string | number
  teamName: string
  played: number
  won: number
  drawn: number
  lost: number
  goalsFor: number
  goalsAgainst: number
  goalDifference: number
  points: number
}

export type Standings = {
  competitionId: string | number
  table: StandingsRow[]
}

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

export type LeagueContext = {
  currentPosition?: number
  gapToLeader?: number
  gapToRelegation?: number
  recentTrend?: 'up' | 'down' | 'stable' | null
  motivationLevel?: 'title' | 'europe' | 'mid_table' | 'relegation' | 'secure' | null
  summary?: string | null
}

export type RecentFormContext = {
  home?: RecentFormItem[]
  away?: RecentFormItem[]
}

export type VenueInfo = {
  name: string
  city?: string
  capacity?: number
}

export type RefereeInfo = {
  name: string
  country?: string
}

export type WeatherInfo = {
  temperature?: number
  condition?: string
  wind?: string
}

export type PlayerLineup = {
  name: string
  position?: string
  shirtNumber?: number
}

export type TeamLineup = {
  starters?: PlayerLineup[]
  substitutes?: PlayerLineup[]
  missing?: string[]
}

export type LineupInfo = {
  home?: TeamLineup
  away?: TeamLineup
}

export type MatchStatistics = {
  score?: any
  possession?: { home?: number; away?: number }
  possessionHome?: number
  possessionAway?: number
  shotsOnTargetHome?: number
  shotsOnTargetAway?: number
  shotsHome?: number
  shotsAway?: number
  [key: string]: any
}

export type TimelineEvent = {
  minute: number
  type: string
  description?: string
  player?: string
  team?: string
  [key: string]: any
}

export type PlayerRating = {
  name: string
  position?: string
  rating: number // typically 0..10
}

export type AnalysisHistoryEntry = {
  timestamp: string
  analysis: any
  version?: string
}

export type MatchContextBase = {
  match: {
    id: string
    status: 'SCHEDULED' | 'LIVE' | 'FINISHED' | string
    kickoff?: string // ISO datetime
  }
  competition?: CompetitionInfo
  teams: {
    home: TeamInfo
    away: TeamInfo
  }
}

export type MatchContext = MatchContextBase & {
  standings?: Standings
  recentForm?: RecentFormContext
  headToHead?: HeadToHeadStats
  leagueContext?: {
    home?: LeagueContext
    away?: LeagueContext
  }
  statistics?: MatchStatistics
  lineups?: LineupInfo
  injuries?: any
  timeline?: TimelineEvent[]
  playerRatings?: {
    home?: PlayerRating[]
    away?: PlayerRating[]
  }
  referee?: RefereeInfo
  venue?: VenueInfo
  weather?: WeatherInfo
  analysisHistory?: AnalysisHistoryEntry[]
}
