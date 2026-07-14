import React from 'react'

export const ErrorState: React.FC<{ title?: string; message?: string }> = ({ title = 'Something went wrong', message = 'There was an unexpected error.' }) => {
  return (
    <div className="w-full rounded-lg border border-red-600 p-6 text-center bg-gray-900/60">
      <div className="text-lg font-semibold text-red-400">{title}</div>
      <div className="text-sm text-gray-300 mt-2">{message}</div>
    </div>
  )
}
