import React from 'react'

export const AIChat: React.FC = () => {
  return (
    <div className="w-full border border-gray-700 rounded-lg p-4 bg-gray-850">
      <div className="text-sm text-gray-400">AI Chat (placeholder)</div>
      <div className="mt-3">
        <textarea className="w-full h-28 rounded-md bg-gray-900 border border-gray-700 p-2 text-gray-100" placeholder="Ask about tactics, strengths, or match context..." />
      </div>
      <div className="mt-3 flex justify-end">
        <button className="px-4 py-2 rounded-md bg-gray-700 text-white">Send</button>
      </div>
    </div>
  )
}
