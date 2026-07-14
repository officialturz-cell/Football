/**
 * Analysis types exported from the analysis module
 */

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
  analysisTimestamp: string
}
