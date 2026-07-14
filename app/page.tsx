import React from 'react'
import Link from 'next/link'
import { fetchMatches } from '@/services/matchService'
import { MatchGrid } from '@/components/MatchGrid'
import { LoadingSkeleton } from '@/components/LoadingSkeleton'
import { EmptyState } from '@/components/EmptyState'

export default async function Page() {
  // Server component — data fetching should be done in services layer.
  const matches = await fetchMatches()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-semibold">Dashboard</h1>
        <div className="flex items-center gap-3">
          <Link href="/search" className="text-sm text-gray-400">Search</Link>
        </div>
      </div>

      <section>
        <h2 className="text-lg font-medium text-gray-200 mb-3">Live</h2>
        {/* TODO: group by status; using empty state now */}
        <div>
          <EmptyState title="No live matches" description="No live matches available — when connected to a data provider this will show ongoing matches." />
        </div>
      </section>

      <section>
        <h2 className="text-lg font-medium text-gray-200 mb-3">Today</h2>
        <div>
          {matches.length === 0 ? <div className="space-y-3"><LoadingSkeleton className="h-24" /><LoadingSkeleton className="h-24" /></div> : <MatchGrid matches={matches} />}
        </div>
      </section>

      <section>
        <h2 className="text-lg font-medium text-gray-200 mb-3">Tomorrow</h2>
        <div>
          <EmptyState title="No matches" description="Tomorrow's matches will appear here once data is available." />
        </div>
      </section>

      <section>
        <h2 className="text-lg font-medium text-gray-200 mb-3">Next 7 Days</h2>
        <div>
          <EmptyState title="No matches" description="Upcoming fixtures will appear here." />
        </div>
      </section>
    </div>
  )
}
