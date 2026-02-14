import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'VoicePost - Voice to Social Media',
  description: 'Record your voice, post to Twitter, LinkedIn, and more',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="bg-white text-gray-900">{children}</body>
    </html>
  )
}
