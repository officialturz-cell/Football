// strategy/builder.ts

import { MatchContext } from '@/context/matchContext'

export type StrategyDecision = {
  preset: string
  promptMode: 'quick' | 'deep' | 'live' | 'postmatch' | 'chat'
  promptVersion: string
  prioritizedModules: string[]
  contextPriorityMap: Record<string, 'high' | 'medium' | 'low' | 'ignore'>
  promptOptions?: Record<string, any>
  responseFormat?: 'json' | 'json+text' | 'text'
  maxWords?: number | null
}

export function createStrategy(matchContext: MatchContext, opts?: { requestedMode?: StrategyDecision['promptMode'] }): StrategyDecision {
  const mode = opts?.requestedMode ?? 'quick'

  // Basic presets for priorities — conservative defaults
  const presets: Record<string, StrategyDecision> = {
    quick: {
      preset: 'quick',
      promptMode: 'quick',
      promptVersion: 'v1',
      prioritizedModules: ['Form', 'Lineups', 'Manager', 'Injuries', 'Standings'],
      contextPriorityMap: {
        form: 'high',
        lineups: 'high',
        standings: 'high',
        injuries: 'high',
        timeline: 'ignore',
        momentum: 'ignore',
        playerRatings: 'ignore'
      } as any,
      promptOptions: { temperature: 0.0 },
      responseFormat: 'json',
      maxWords: 250
    },
    deep: {
      preset: 'deep',
      promptMode: 'deep',
      promptVersion: 'v1',
      prioritizedModules: ['Form', 'Lineups', 'Tactics', 'Statistics', 'Manager', 'Injuries', 'Standings'],
      contextPriorityMap: {
        form: 'high',
        lineups: 'high',
        standings: 'high',
        injuries: 'high',
        timeline: 'medium',
        momentum: 'medium',
        playerRatings: 'medium'
      } as any,
      promptOptions: { temperature: 0.0 },
      responseFormat: 'json',
      maxWords: null
    },
    live: {
      preset: 'live',
      promptMode: 'live',
      promptVersion: 'v1',
      prioritizedModules: ['Timeline', 'Momentum', 'Statistics', 'Cards', 'Substitutions'],
      contextPriorityMap: {
        timeline: 'high',
        statistics: 'high',
        momentum: 'high',
        form: 'low'
      } as any,
      promptOptions: { temperature: 0.0 },
      responseFormat: 'json+text',
      maxWords: 200
    },
    postmatch: {
      preset: 'postmatch',
      promptMode: 'postmatch',
      promptVersion: 'v1',
      prioritizedModules: ['Turning points', 'Timeline', 'Manager decisions', 'Substitutions', 'Tactical changes', 'Player ratings'],
      contextPriorityMap: {
        timeline: 'high',
        playerRatings: 'high',
        substitutions: 'high'
      } as any,
      promptOptions: { temperature: 0.0 },
      responseFormat: 'json',
      maxWords: null
    },
    chat: {
      preset: 'chat',
      promptMode: 'chat',
      promptVersion: 'v1',
      prioritizedModules: ['Form', 'Lineups', 'HeadToHead'],
      contextPriorityMap: {
        form: 'medium',
        lineups: 'medium',
        standings: 'low'
      } as any,
      promptOptions: { temperature: 0.2 },
      responseFormat: 'json+text',
      maxWords: 150
    }
  }

  return presets[mode] ?? presets.quick
}
