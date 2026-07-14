import React from 'react'
import { fetchMatches } from '@/services/matchService'
import { MatchGrid } from '@/components/MatchGrid'
import { EmptyState } from '@/components/EmptyState'

export default async function TodayPage() {
  const matches = await fetchMatches()
  return (
    <div>
      <h1 className="text-2xl font-semibold mb-4">Today's Matches</h1>
      {matches.length === 0 ? <EmptyState title="No matches for today" description="Connect a football data provider to see matches." /> : <MatchGrid matches={matches} />}
    </div>
  )
}
