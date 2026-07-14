export type Team = {
  id: string
  name: string
  shortName?: string
  logo?: string
}

export type Competition = {
  id: string
  name: string
  country?: string
}

export type MatchStatus = 'SCHEDULED' | 'LIVE' | 'FINISHED'

export type Match = {
  id: string
  competition: Competition
  kickoff: string // ISO datetime
  home: Team
  away: Team
  status: MatchStatus
  venue?: string
}

export type AnalysisResult = {
  homeWin?: string
  draw?: string
  awayWin?: string
  btts?: string
  overUnder?: string
  correctScore?: string
  confidence?: number
  summary?: string
  tacticalInsight?: string
  strengths?: string[]
  weaknesses?: string[]
  risks?: string[]
  createdAt: string
}
