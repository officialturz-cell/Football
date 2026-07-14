import React from 'react'
import { Match } from '@/types'
import { Button } from '@/components/ui/Button'
import { formatKickoff } from '@/utils/format'
import Link from 'next/link'

type Props = {
  match: Match
}

export const MatchCard: React.FC<Props> = ({ match }) => {
  return (
    <article className="w-full bg-gray-900/30 border border-gray-700 rounded-lg p-4 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-300">{match.competition.name}</div>
        <div className="text-xs text-gray-400">{formatKickoff(match.kickoff)}</div>
      </div>

      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <img src={match.home.logo ?? '/placeholder-team.svg'} alt={match.home.name} className="w-10 h-10 object-contain" />
          <div className="text-white font-semibold">{match.home.name}</div>
        </div>

        <div className="text-gray-400">vs</div>

        <div className="flex items-center gap-3">
          <div className="text-white font-semibold">{match.away.name}</div>
          <img src={match.away.logo ?? '/placeholder-team.svg'} alt={match.away.name} className="w-10 h-10 object-contain" />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Link href={`/match/${match.id}`}>
          <Button variant="primary">Analyze</Button>
        </Link>
        <Button variant="ghost" aria-label="favorite">☆ Favorite</Button>
      </div>
    </article>
  )
}
