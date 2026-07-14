import React from 'react'
import { fetchMatchById } from '@/services/matchService'
import { AnalysisPlaceholder } from '@/components/AnalysisPlaceholder'
import { TacticalBoardPlaceholder } from '@/components/TacticalBoardPlaceholder'
import { AIChat } from '@/components/AIChat'
import { EmptyState } from '@/components/EmptyState'

type Props = { params: { id: string } }

export default async function MatchPage({ params }: Props) {
  const { id } = params
  const match = await fetchMatchById(id)

  if (!match) {
    return <EmptyState title="Match not found" description="This match is not available in the current dataset." />
  }

  return (
    <div className="space-y-6">
      <header className="bg-gray-900/40 border border-gray-700 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm text-gray-400">{match.competition.name}</div>
            <div className="text-2xl font-semibold">{match.home.name} vs {match.away.name}</div>
            <div className="text-sm text-gray-500">Kickoff: {match.kickoff}</div>
          </div>
          <div>
            <button className="px-4 py-2 rounded-md bg-emerald-600 text-white">🧠 Calculate Football Analysis</button>
          </div>
        </div>
      </header>

      <section className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-gray-850 border border-gray-700 rounded-lg p-4">
            <h3 className="text-lg font-medium mb-3">Statistics</h3>
            <div className="text-sm text-gray-400">Placeholder for match statistics component</div>
          </div>

          <div className="bg-gray-850 border border-gray-700 rounded-lg p-4">
            <h3 className="text-lg font-medium mb-3">Timeline</h3>
            <div className="text-sm text-gray-400">Placeholder for event timeline</div>
          </div>

          <div className="bg-gray-850 border border-gray-700 rounded-lg p-4">
            <h3 className="text-lg font-medium mb-3">Head To Head</h3>
            <div className="text-sm text-gray-400">Placeholder for head to head</div>
          </div>
        </div>

        <aside className="space-y-4">
          <div className="bg-gray-850 border border-gray-700 rounded-lg p-4">
            <h3 className="text-lg font-medium mb-3">Analysis</h3>
            <AnalysisPlaceholder />
          </div>

          <div className="bg-gray-850 border border-gray-700 rounded-lg p-4">
            <h3 className="text-lg font-medium mb-3">Tactical Board</h3>
            <TacticalBoardPlaceholder />
          </div>
        </aside>
      </section>

      <section>
        <h3 className="text-lg font-medium mb-3">AI Chat</h3>
        <AIChat />
      </section>
    </div>
  )
}
