import React from 'react'

export const EmptyState: React.FC<{ title?: string; description?: string }> = ({ title = 'No data', description = 'Nothing to show here yet.' }) => {
  return (
    <div className="w-full rounded-lg border border-dashed border-gray-700 p-8 text-center">
      <div className="text-lg font-medium text-gray-100">{title}</div>
      <div className="text-sm text-gray-400 mt-2">{description}</div>
    </div>
  )
}
