import type { Metadata } from 'next'
import { Manrope, Inter } from 'next/font/google'
import './globals.css'

const manrope = Manrope({
  subsets:  ['latin'],
  variable: '--font-manrope',
  display:  'swap',
})

const inter = Inter({
  subsets:  ['latin'],
  variable: '--font-inter',
  display:  'swap',
})

export const metadata: Metadata = {
  title:       'Brighter Nepal — Academic Curator',
  description: "Nepal's premier digital learning platform. Access world-class resources curated for exam success.",
  keywords:    ['IOE Entrance', 'Nepal exam preparation', 'model sets', 'academic resources', 'Brighter Nepal'],
  authors:     [{ name: 'Brighter Nepal' }],
  openGraph: {
    title:       'Brighter Nepal — Academic Curator',
    description: "Nepal's premier digital learning platform for entrance exam preparation.",
    type:        'website',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${manrope.variable} ${inter.variable}`}>
      <body className="bg-surface text-on-surface font-body antialiased">
        {children}
      </body>
    </html>
  )
}
