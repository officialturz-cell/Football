import React from 'react'

export const Header: React.FC = () => {
  return (
    <header className="w-full flex items-center justify-between py-4 px-6 bg-gradient-to-b from-gray-900/60 to-transparent">
      <div className="flex items-center gap-4">
        <div className="text-2xl font-semibold text-white">Football Analyst AI</div>
        <div className="text-sm text-gray-400">Personal analysis</div>
      </div>
      <nav className="flex items-center gap-4 text-sm">
        <a href="/" className="text-gray-300 hover:text-white">Home</a>
        <a href="/today" className="text-gray-300 hover:text-white">Today</a>
        <a href="/tomorrow" className="text-gray-300 hover:text-white">Tomorrow</a>
        <a href="/live" className="text-gray-300 hover:text-white">Live</a>
        <a href="/settings" className="text-gray-400 hover:text-white">Settings</a>
      </nav>
    </header>
  )
}
