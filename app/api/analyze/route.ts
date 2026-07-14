import { NextRequest } from 'next/server'
import { createStrategy } from '@/strategy/builder'
import { createDefaultPersonality } from '@/personality/builder'
import { createStrategyPromptBuilder } from '@/prompts/builder'
import { GeminiProvider } from '@/providers/ai/GeminiProvider'
import { tryParseJson } from '@/providers/ai/GeminiResponseParser'
import { MatchContext } from '@/context/matchContext'
import { AnalysisResult } from '@/analysis/types'
import * as football from '@/football'

// Simple helper to parse JSON body safely
async function parseJsonSafe(req: Request) {
  try {
    return await req.json()
  } catch (err) {
    return null
  }
}

function validateMode(mode: unknown): mode is 'quick' | 'deep' | 'live' | 'postmatch' | 'chat' {
  return typeof mode === 'string' && ['quick', 'deep', 'live', 'postmatch', 'chat'].includes(mode)
}

function simpleValidateAnalysisResult(obj: unknown): obj is AnalysisResult {
  if (!obj || typeof obj !== 'object') return false
  const asAny = obj as any
  // analysisTimestamp is required
  if (!asAny.analysisTimestamp || typeof asAny.analysisTimestamp !== 'string') return false
  // At least one predictive field or summary should exist
  if (
    asAny.summary ||
    asAny.homeWin ||
    asAny.draw ||
    asAny.awayWin ||
    asAny.btts ||
    asAny.overUnder ||
    asAny.correctScore
  ) {
    return true
  }
  return false
}

export async function POST(req: Request) {
  const requestId = `${Date.now()}-${Math.floor(Math.random() * 100000)}`
  const startTime = Date.now()

  const body = await parseJsonSafe(req)
  if (!body) return new Response(JSON.stringify({ error: 'Invalid JSON' }), { status: 400 })

  const { matchId, mode, question } = body as { matchId?: string; mode?: unknown; question?: string }

  if (!matchId || typeof matchId !== 'string') {
    return new Response(JSON.stringify({ error: 'matchId is required' }), { status: 400 })
  }

  if (!validateMode(mode)) {
    return new Response(JSON.stringify({ error: 'mode must be one of quick, deep, live, postmatch, chat' }), { status: 400 })
  }

  // Build a minimal MatchContext. Later replace with real ContextBuilder implementation.
  const matchContext: MatchContext = {
    match: { id: matchId, status: mode === 'live' ? 'LIVE' : mode === 'postmatch' ? 'FINISHED' : 'SCHEDULED' } as any,
    teams: { home: { id: 'home', name: 'Home' } as any, away: { id: 'away', name: 'Away' } as any }
  }

  // Decide strategy
  const strategy = createStrategy(matchContext, { requestedMode: mode === 'chat' ? 'chat' : (mode as any) })

  // Create personality
  const personality = createDefaultPersonality()

  // Load football modules (collect exported guideline objects from /football)
  const footballModules: any[] = []
  Object.keys(football).forEach(k => {
    // only include objects that look like guideline (have name and description)
    const val = (football as any)[k]
    if (val && typeof val === 'object' && 'name' in val && 'description' in val) footballModules.push(val)
  })

  // Build prompt using Strategy-driven PromptBuilder
  const promptBuilder = createStrategyPromptBuilder({ strategy, context: matchContext, personality, footballModules, userQuestion: question })

  let payload
  let preview
  let debug
  try {
    const built = await promptBuilder.build()
    payload = built.payload
    preview = built.preview
    debug = built.debug
  } catch (err) {
    console.error('Prompt build failed', { requestId, err })
    return new Response(JSON.stringify({ error: 'Failed to build prompt' }), { status: 500 })
  }

  // Instantiate Gemini provider (server-side only)
  const gemini = new GeminiProvider()

  // Health check quick guard
  const health = await gemini.healthCheck().catch(() => ({ status: 'offline' }))
  if (health.status === 'offline') {
    console.error('Gemini provider offline', { requestId, health })
    return new Response(JSON.stringify({ error: 'AI provider unavailable' }), { status: 503 })
  }

  // Call provider
  let aiResponse
  try {
    aiResponse = await gemini.generate(payload.prompt, matchContext, { promptOptions: payload.options as any, promptVersion: payload.metadata.version, strategy: strategy.preset })
  } catch (err: any) {
    console.error('Provider generate error', { requestId, err })
    if (err.name === 'RateLimitError') return new Response(JSON.stringify({ error: 'Rate limited' }), { status: 429 })
    if (err.name === 'UnauthorizedError') return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 })
    if (err.name === 'TimeoutError') return new Response(JSON.stringify({ error: 'AI provider timeout' }), { status: 503 })
    return new Response(JSON.stringify({ error: 'AI provider failure' }), { status: 500 })
  }

  // Parse/validate JSON result
  let parsed: any = null
  if ((aiResponse as any).parsed) {
    parsed = (aiResponse as any).parsed
  } else if (typeof (aiResponse as any).raw === 'string') {
    try {
      parsed = tryParseJson((aiResponse as any).raw)
    } catch (err) {
      parsed = null
    }
  }

  if (!parsed) {
    console.warn('AI returned no parseable JSON', { requestId })
    return new Response(JSON.stringify({ error: 'AI returned unstructured response' }), { status: 502 })
  }

  // Basic validation
  if (!simpleValidateAnalysisResult(parsed)) {
    console.warn('Parsed analysis failed validation', { requestId, parsed })
    return new Response(JSON.stringify({ error: 'Invalid analysis result from AI' }), { status: 502 })
  }

  const analysis: AnalysisResult = parsed as AnalysisResult

  // Final logging
  const duration = Date.now() - startTime
  console.info(JSON.stringify({ requestId, strategy: strategy.preset, promptVersion: payload.metadata.version, provider: 'gemini', durationMs: duration, model: (aiResponse as any).model ?? null }))

  // Return only the AnalysisResult JSON — do NOT expose provider raw content
  return new Response(JSON.stringify({ analysis }), { status: 200, headers: { 'Content-Type': 'application/json' } })
}
