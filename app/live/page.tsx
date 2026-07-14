import React from 'react'
import { fetchMatches } from '@/services/matchService'
import { MatchGrid } from '@/components/MatchGrid'
import { EmptyState } from '@/components/EmptyState'

export default async function LivePage() {
  const matches = await fetchMatches()
  return (
    <div>
      <h1 className="text-2xl font-semibold mb-4">Live Matches</h1>
      {matches.length === 0 ? <EmptyState title="No live matches" description="Live matches will appear here when connected." /> : <MatchGrid matches={matches} />}
    </div>
  )
}
