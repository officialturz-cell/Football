import { MatchContext, RecentFormItem } from '@/context/matchContext'
import { Evidence, EvidenceCategory, EvidenceImportance } from './EvidenceTypes'
import { scoreImportance, scoreConfidence } from './EvidenceScoring'

function uid(prefix = ''): string {
  return `${prefix}${Date.now().toString(36)}-${Math.floor(Math.random() * 10000)}`
}

/**
 * Convert recent form arrays into evidence items.
 * Returns an array of Evidence extracted from matchContext.recentForm
 */
export function buildRecentFormEvidence(ctx: MatchContext): Evidence[] {
  const out: Evidence[] = []
  const rf = ctx.recentForm
  if (!rf) return out

  const process = (side: 'home' | 'away') => {
    const arr: RecentFormItem[] | undefined = (rf as any)[side]
    if (!arr || !Array.isArray(arr) || arr.length === 0) return

    const matches = arr
    const played = matches.length
    const wins = matches.filter(m => m.result === 'W').length
    const draws = matches.filter(m => m.result === 'D').length
    const losses = matches.filter(m => m.result === 'L').length
    const goalsFor = matches.reduce((s, m) => {
      const parts = (m.score || '0-0').split('-').map(n => parseInt(n, 10) || 0)
      return s + parts[0]
    }, 0)
    const goalsAgainst = matches.reduce((s, m) => {
      const parts = (m.score || '0-0').split('-').map(n => parseInt(n, 10) || 0)
      return s + parts[1]
    }, 0)
    const avgFor = played ? +(goalsFor / played).toFixed(2) : 0
    const avgAgainst = played ? +(goalsAgainst / played).toFixed(2) : 0
    const cleanSheets = matches.filter(m => (m.score || '0-0').startsWith('0-')).length
    const failedToScore = matches.filter(m => (m.score || '0-0').split('-').map(n => parseInt(n, 10) || 0)[0] === 0).length

    // streaks
    let winStreak = 0
    for (let i = 0; i < matches.length; i++) {
      if (matches[i].result === 'W') winStreak++
      else break
    }
    let unbeatenStreak = 0
    for (let i = 0; i < matches.length; i++) {
      if (matches[i].result === 'W' || matches[i].result === 'D') unbeatenStreak++
      else break
    }

    const baseDetails = { side, played, wins, draws, losses, goalsFor, goalsAgainst, avgFor, avgAgainst, cleanSheets, failedToScore, winStreak, unbeatenStreak }

    // Evidence items: summarized signals
    // 1) win ratio
    const winRatio = played ? wins / played : 0
    const winDesc = `${wins} win${wins === 1 ? '' : 's'} in the last ${played} matches for the ${side} side.`
    out.push({ id: uid('rf-win-'), category: EvidenceCategory.RECENT_FORM, importance: scoreImportance(winRatio, 'recent_form'), confidence: scoreConfidence(played, 5), description: winDesc, details: { ...baseDetails } })

    // 2) unbeaten or losing streaks
    if (winStreak >= 2) {
      out.push({ id: uid('rf-wst-'), category: EvidenceCategory.RECENT_FORM, importance: EvidenceImportance.HIGH, confidence: scoreConfidence(played, 5), description: `${side} on a ${winStreak}-match winning run.`, details: { winStreak, ...baseDetails } })
    }
    if (unbeatenStreak >= 3) {
      out.push({ id: uid('rf-ust-'), category: EvidenceCategory.RECENT_FORM, importance: EvidenceImportance.HIGH, confidence: scoreConfidence(played, 5), description: `${side} unbeaten in the last ${unbeatenStreak} matches.`, details: { unbeatenStreak, ...baseDetails } })
    }

    // 3) attacking/defensive averages
    out.push({ id: uid('rf-avg-'), category: EvidenceCategory.RECENT_FORM, importance: scoreImportance(avgFor, 'goals'), confidence: scoreConfidence(played, 5), description: `${side} averaging ${avgFor} goals scored per match in last ${played}.`, details: { avgFor, avgAgainst } })

    // 4) clean sheets / failed to score
    if (cleanSheets >= 2) {
      out.push({ id: uid('rf-cs-'), category: EvidenceCategory.RECENT_FORM, importance: EvidenceImportance.MEDIUM, confidence: scoreConfidence(played, 5), description: `${side} kept ${cleanSheets} clean sheets in last ${played} matches.`, details: baseDetails })
    }
    if (failedToScore >= 2) {
      out.push({ id: uid('rf-fs-'), category: EvidenceCategory.RECENT_FORM, importance: EvidenceImportance.MEDIUM, confidence: scoreConfidence(played, 5), description: `${side} failed to score in ${failedToScore} of last ${played} matches.`, details: baseDetails })
    }
  }

  process('home')
  process('away')

  return out
}

/**
 * Convert head-to-head context into evidence items
 */
export function buildHeadToHeadEvidence(ctx: MatchContext): Evidence[] {
  const out: Evidence[] = []
  const hh = (ctx as any).headToHead
  if (!hh) return out

  const meetings = hh.meetings as any[] | undefined
  const count = meetings ? meetings.length : 0
  if (!meetings || count === 0) return out

  const homeUnbeaten = hh.homeWins + hh.draws === count
  const bttsRatio = count ? hh.btts / count : 0
  const over25Ratio = count ? hh.over25 / count : 0
  const avgGoals = hh.averageGoals ?? 0

  if (homeUnbeaten && count >= 3) {
    out.push({ id: uid('h2h-unb-'), category: EvidenceCategory.HEAD_TO_HEAD, importance: EvidenceImportance.HIGH, confidence: scoreConfidence(count, 5), description: `Home team unbeaten in ${count} recent meetings.`, details: { count, homeUnbeaten } })
  }

  if (bttsRatio >= 0.6) {
    out.push({ id: uid('h2h-btts-'), category: EvidenceCategory.HEAD_TO_HEAD, importance: EvidenceImportance.HIGH, confidence: scoreConfidence(count, 5), description: `Both teams scored in ${Math.round(bttsRatio * 100)}% of the last ${count} meetings.`, details: { btts: hh.btts, count } })
  } else if (bttsRatio > 0) {
    out.push({ id: uid('h2h-btts-low-'), category: EvidenceCategory.HEAD_TO_HEAD, importance: EvidenceImportance.MEDIUM, confidence: scoreConfidence(count, 5), description: `BTTS occurred in ${Math.round(bttsRatio * 100)}% of last ${count} meetings.`, details: { btts: hh.btts, count } })
  }

  if (over25Ratio >= 0.6) {
    out.push({ id: uid('h2h-over-'), category: EvidenceCategory.HEAD_TO_HEAD, importance: EvidenceImportance.MEDIUM, confidence: scoreConfidence(count, 5), description: `Over 2.5 goals in ${Math.round(over25Ratio * 100)}% of the last ${count} meetings.`, details: { over25: hh.over25, count } })
  }

  if (avgGoals > 2.5) {
    out.push({ id: uid('h2h-avg-'), category: EvidenceCategory.HEAD_TO_HEAD, importance: EvidenceImportance.MEDIUM, confidence: scoreConfidence(count, 5), description: `Average goals across last ${count} meetings: ${avgGoals}.`, details: { averageGoals: avgGoals } })
  }

  return out
}

/**
 * Convert league context into evidence
 */
export function buildLeagueEvidence(ctx: MatchContext): Evidence[] {
  const out: Evidence[] = []
  const lc = (ctx as any).leagueContext
  if (!lc) return out

  const processSide = (side: 'home' | 'away') => {
    const s = lc[side]
    if (!s) return

    const pos = s.currentPosition
    const gapLeader = s.gapToLeader
    const gapReleg = s.gapToRelegation
    const motivation = s.motivationLevel

    if (pos !== undefined) {
      const desc = `Current league position: ${pos}.`
      out.push({ id: uid('lg-pos-'), category: EvidenceCategory.LEAGUE, importance: scoreImportance(pos, 'league_position'), confidence: scoreConfidence(pos ? 1 : 0, 1), description: `${side} ${desc}`, details: { pos } })
    }

    if (gapLeader !== undefined && gapLeader <= 3) {
      out.push({ id: uid('lg-gap-'), category: EvidenceCategory.LEAGUE, importance: EvidenceImportance.CRITICAL, confidence: scoreConfidence(1, 1), description: `${side} are only ${gapLeader} points behind the leader — title race relevant.`, details: { gapLeader } })
    } else if (gapLeader !== undefined && gapLeader <= 8) {
      out.push({ id: uid('lg-gap-med-'), category: EvidenceCategory.LEAGUE, importance: EvidenceImportance.HIGH, confidence: scoreConfidence(1, 1), description: `${side} are ${gapLeader} points off the leader — in contention.`, details: { gapLeader } })
    }

    if (gapReleg !== undefined && gapReleg <= 3) {
      out.push({ id: uid('lg-releg-'), category: EvidenceCategory.LEAGUE, importance: EvidenceImportance.CRITICAL, confidence: scoreConfidence(1, 1), description: `${side} are ${gapReleg} points above the relegation zone — relegation risk.`, details: { gapReleg } })

    }

    if (motivation) {
      out.push({ id: uid('lg-mot-'), category: EvidenceCategory.LEAGUE, importance: EvidenceImportance.HIGH, confidence: scoreConfidence(1, 1), description: `${side} motivation level: ${motivation}.`, details: { motivation } })
    }

    if (s.summary) {
      out.push({ id: uid('lg-sum-'), category: EvidenceCategory.LEAGUE, importance: EvidenceImportance.MEDIUM, confidence: scoreConfidence(1, 1), description: `${side} league summary: ${s.summary}`, details: { summary: s.summary } })
    }
  }

  processSide('home')
  processSide('away')

  return out
}

/**
 * Convert basic statistics into evidence if available
 */
export function buildStatisticsEvidence(ctx: MatchContext): Evidence[] {
  const out: Evidence[] = []
  const stats = ctx.statistics
  if (!stats || typeof stats !== 'object') return out

  // Example: if possession or shots keys exist, derive evidence conservatively
  const possessionHome = (stats as any).possessionHome ?? (stats as any).possession?.home
  const possessionAway = (stats as any).possessionAway ?? (stats as any).possession?.away
  if (typeof possessionHome === 'number' && typeof possessionAway === 'number') {
    const desc = `Home possession ${possessionHome}% vs Away ${possessionAway}%.`
    const importance = possessionHome > 60 || possessionAway > 60 ? EvidenceImportance.HIGH : EvidenceImportance.MEDIUM
    const confidence = 0.9
    out.push({ id: uid('st-pos-'), category: EvidenceCategory.STATISTICS, importance, confidence, description: desc, details: { possessionHome, possessionAway } })
  }

  const shotsHome = (stats as any).shotsOnTargetHome ?? (stats as any).shotsHome
  const shotsAway = (stats as any).shotsOnTargetAway ?? (stats as any).shotsAway
  if (typeof shotsHome === 'number' && typeof shotsAway === 'number') {
    const desc = `Shot volume: home ${shotsHome} vs away ${shotsAway}.`
    out.push({ id: uid('st-shots-'), category: EvidenceCategory.STATISTICS, importance: EvidenceImportance.MEDIUM, confidence: 0.8, description: desc, details: { shotsHome, shotsAway } })
  }

  return out
}

/**
 * Convert lineup info into evidence
 */
export function buildLineupEvidence(ctx: MatchContext): Evidence[] {
  const out: Evidence[] = []
  const lineups = ctx.lineups
  if (!lineups || typeof lineups !== 'object') return out

  // Attempt to detect missing key players if the provider includes 'missing' arrays or explicit notes
  // We are conservative: only produce evidence for clearly labeled missing starters
  const detectMissing = (side: 'home' | 'away') => {
    const info = (lineups as any)[side]
    if (!info) return
    if (Array.isArray(info.missing) && info.missing.length > 0) {
      out.push({ id: uid('ln-miss-'), category: EvidenceCategory.LINEUP, importance: EvidenceImportance.HIGH, confidence: 0.9, description: `${side} missing ${info.missing.length} first-team player(s).`, details: { missing: info.missing } })
    }
    if (Array.isArray(info.starters) && info.starters.length && info.starters.length < 11) {
      out.push({ id: uid('ln-smol-'), category: EvidenceCategory.LINEUP, importance: EvidenceImportance.MEDIUM, confidence: 0.8, description: `${side} starting XI incomplete (${info.starters.length}).`, details: { startersCount: info.starters.length } })
    }
  }

  detectMissing('home')
  detectMissing('away')

  return out
}

/**
 * Main EvidenceBuilder: convert MatchContext into a list of Evidence items.
 */
export function buildEvidenceFromContext(ctx: MatchContext): Evidence[] {
  const evidence: Evidence[] = []
  evidence.push(...buildRecentFormEvidence(ctx))
  evidence.push(...buildHeadToHeadEvidence(ctx))
  evidence.push(...buildLeagueEvidence(ctx))
  evidence.push(...buildStatisticsEvidence(ctx))
  evidence.push(...buildLineupEvidence(ctx))

  // Score importance for each item using scoring heuristics
  for (const e of evidence) {
    // if importance already set to computed value string, keep it; otherwise compute using scoreImportance
    if (!e.importance) {
      (e as any).importance = EvidenceImportance.MEDIUM
    }
    // confidence already set by builders using scoreConfidence or heuristics
    if (typeof e.confidence !== 'number') e.confidence = 0.5
  }

  return evidence
}
