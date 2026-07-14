import React from 'react'

export const SearchBar: React.FC = () => {
  return (
    <div className="w-full max-w-xl">
      <input
        placeholder="Search matches, teams, competitions..."
        className="w-full rounded-md bg-gray-850 border border-gray-700 px-4 py-2 text-gray-100 placeholder-gray-500"
      />
    </div>
  )
}
