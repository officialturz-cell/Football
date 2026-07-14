import React from 'react'

export const AnalysisPlaceholder: React.FC = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="space-y-3">
        <div className="bg-gray-850 border border-gray-700 rounded-lg p-4">
          <div className="text-sm text-gray-400">Home Win</div>
          <div className="text-lg text-white">—</div>
        </div>
        <div className="bg-gray-850 border border-gray-700 rounded-lg p-4">
          <div className="text-sm text-gray-400">Draw</div>
          <div className="text-lg text-white">—</div>
        </div>
        <div className="bg-gray-850 border border-gray-700 rounded-lg p-4">
          <div className="text-sm text-gray-400">Away Win</div>
          <div className="text-lg text-white">—</div>
        </div>
      </div>

      <div className="space-y-3">
        <div className="bg-gray-850 border border-gray-700 rounded-lg p-4">
          <div className="text-sm text-gray-400">Confidence</div>
          <div className="text-lg text-white">—</div>
        </div>
        <div className="bg-gray-850 border border-gray-700 rounded-lg p-4">
          <div className="text-sm text-gray-400">Summary</div>
          <div className="text-sm text-gray-300">—</div>
        </div>
      </div>
    </div>
  )
}
