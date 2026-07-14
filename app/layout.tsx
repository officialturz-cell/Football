import React from 'react'
import '@/styles/globals.css'
import { Header } from '@/components/Header'
import { SITE_TITLE, SITE_DESCRIPTION } from '@/lib/constants'

export const metadata = {
  title: SITE_TITLE,
  description: SITE_DESCRIPTION
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className="bg-gray-950 text-white min-h-screen antialiased">
        <div className="min-h-screen max-w-6xl mx-auto">
          <Header />
          <main className="p-6">{children}</main>
        </div>
      </body>
    </html>
  )
}
