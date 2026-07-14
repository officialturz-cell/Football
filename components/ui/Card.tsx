import React from 'react'

export const Card: React.FC<React.PropsWithChildren<{ className?: string }>> = ({ children, className = '' }) => {
  return (
    <div className={`bg-gray-850 border border-gray-700 rounded-lg p-4 ${className}`}>{children}</div>
  )
}
