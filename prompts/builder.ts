import { MatchContext } from '@/context/matchContext'
import { StrategyDecision } from '@/strategy/builder'
import { PersonalityProfile } from '@/personality/builder'
import { PromptOptions, DEFAULT_PROMPT_OPTIONS } from './constants'
import { estimateTokens, PromptPreview } from './preview'

export type StrategyPromptBuilderConfig = {
  strategy: StrategyDecision
  context: MatchContext
  personality: PersonalityProfile
  footballModules: any[]
  userQuestion?: string
}

export type PromptPayload = {
  prompt: string
  options: Partial<PromptOptions>
  metadata: {
    version: string
    strategy: string
    modulesUsed: string[]
  }
}

export type PromptBuilderResult = {
  payload: PromptPayload
  preview: PromptPreview
  debug: {
    contextSummary: string
    personalityUsed: string
  }
}

/**
 * StrategyPromptBuilder constructs LLM prompts using strategy-driven module selection
 * and personality guidance.
 */
export class StrategyPromptBuilder {
  private config: StrategyPromptBuilderConfig

  constructor(config: StrategyPromptBuilderConfig) {
    this.config = config
  }

  private buildSystemPrompt(): string {
    const { personality } = this.config
    return `You are a football analysis assistant. ${personality.styleGuidance}
    
Always use language that avoids: ${personality.forbidden.join(', ')}.
Preferred confidence phrases: ${personality.confidence.preferred.join(', ')}.
Tone: ${personality.tone.join(', ')}.`
  }

  private buildContextSection(): string {
    const { context } = this.config
    const lines: string[] = []

    // Match info
    lines.push(`Match: ${context.teams.home.name} vs ${context.teams.away.name}`)
    if (context.competition?.name) lines.push(`Competition: ${context.competition.name}`)
    if (context.match.kickoff) lines.push(`Kickoff: ${context.match.kickoff}`)
    lines.push(`Status: ${context.match.status}`)

    // Recent form
    if (context.recentForm?.home) {
      lines.push(`Home recent form (${context.recentForm.home.length} matches):`)
      context.recentForm.home.forEach(m => {
        lines.push(`  - vs ${m.opponent}: ${m.score} (${m.result})`)
      })
    }
    if (context.recentForm?.away) {
      lines.push(`Away recent form (${context.recentForm.away.length} matches):`)
      context.recentForm.away.forEach(m => {
        lines.push(`  - vs ${m.opponent}: ${m.score} (${m.result})`)
      })
    }

    // League standings
    if (context.standings?.table) {
      const homeRow = context.standings.table.find(r => String(r.teamId) === String(context.teams.home.id))
      const awayRow = context.standings.table.find(r => String(r.teamId) === String(context.teams.away.id))
      if (homeRow) lines.push(`Home league position: ${homeRow.position} (${homeRow.points} pts)`)
      if (awayRow) lines.push(`Away league position: ${awayRow.position} (${awayRow.points} pts)`)
    }

    return lines.join('\n')
  }

  private buildFootballModulesSection(): string {
    const { footballModules } = this.config
    if (footballModules.length === 0) return ''
    return `\nFootball guidelines:\n${footballModules.map(m => `- ${m.name}: ${m.description}`).join('\n')}`
  }

  private buildUserQuestionSection(): string {
    const { userQuestion, strategy } = this.config
    if (!userQuestion) return ''
    return `\nUser question: ${userQuestion}\nRespect the ${strategy.promptMode} mode: prioritize ${strategy.prioritizedModules.join(', ')}.`
  }

  private buildResponseFormatSection(): string {
    const { strategy } = this.config
    const formatGuide = {
      json: 'Return only valid JSON with fields: homeWin, draw, awayWin, btts, overUnder, correctScore, confidence (0-1), summary, and analysisTimestamp (ISO string).',
      'json+text': 'Provide both JSON (as above) and a brief text summary (2-3 sentences).',
      text: 'Provide a detailed text analysis without JSON structure.'
    }
    return `\nResponse format: ${formatGuide[strategy.responseFormat ?? 'json']}`
  }

  async build(): Promise<PromptBuilderResult> {
    const { strategy, personality, userQuestion } = this.config

    // Build prompt sections
    const systemPrompt = this.buildSystemPrompt()
    const contextSection = this.buildContextSection()
    const footballSection = this.buildFootballModulesSection()
    const userSection = this.buildUserQuestionSection()
    const formatSection = this.buildResponseFormatSection()

    const fullPrompt = `${systemPrompt}\n\n${contextSection}${footballSection}${userSection}${formatSection}`

    // Estimate tokens
    const tokens = estimateTokens(fullPrompt)
    const finalPrompt = strategy.maxWords ? fullPrompt.slice(0, strategy.maxWords * 4) : fullPrompt

    // Build payload
    const payload: PromptPayload = {
      prompt: finalPrompt,
      options: strategy.promptOptions ?? DEFAULT_PROMPT_OPTIONS,
      metadata: {
        version: strategy.promptVersion,
        strategy: strategy.preset,
        modulesUsed: strategy.prioritizedModules
      }
    }

    // Build preview
    const preview: PromptPreview = {
      finalPrompt: finalPrompt.slice(0, 500),
      length: finalPrompt.length,
      estimatedTokens: tokens,
      modulesUsed: strategy.prioritizedModules,
      trimmedContextSummary: `${this.config.context.teams.home.name} vs ${this.config.context.teams.away.name}`
    }

    // Debug info
    const debug = {
      contextSummary: `Match: ${this.config.context.match.status}, Teams: ${this.config.context.teams.home.name} vs ${this.config.context.teams.away.name}`,
      personalityUsed: personality.name
    }

    return { payload, preview, debug }
  }
}

/**
 * Factory function to create a StrategyPromptBuilder instance
 */
export function createStrategyPromptBuilder(
  config: StrategyPromptBuilderConfig
): StrategyPromptBuilder {
  return new StrategyPromptBuilder(config)
}
