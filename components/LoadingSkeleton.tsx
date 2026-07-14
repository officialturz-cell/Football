import React from 'react'

export const LoadingSkeleton: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <div className={`animate-pulse bg-gradient-to-r from-gray-800 via-gray-850 to-gray-800 ${className}`}>
      <div className="h-24 w-full rounded-lg" />
    </div>
  )
}
