import React from 'react'
import { Match } from '@/types'
import { MatchCard } from '@/components/MatchCard'

export const MatchGrid: React.FC<{ matches: Match[] }> = ({ matches }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {matches.map(m => (
        <MatchCard key={m.id} match={m} />
      ))}
    </div>
  )
}
