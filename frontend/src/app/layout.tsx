import type { Metadata } from 'next'
import { Plus_Jakarta_Sans } from 'next/font/google'
import './globals.css'
import { Providers } from './providers'

const plusJakartaSans = Plus_Jakarta_Sans({ 
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Cafe Order System',
  description: '自然モチーフのカフェ向け注文システム',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ja" className={plusJakartaSans.variable}>
      <body className="font-display bg-background-light dark:bg-background-dark antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
