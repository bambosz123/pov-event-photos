import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Toaster } from 'react-hot-toast'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Galeria Studniówka 2026',
  description: 'Galeria zdjęć ze studniówki 2026',
  manifest: '/manifest.json',  // ← DODAJ TĘ LINIĘ
  icons: {
    icon: '/icon-192x192.png',
    apple: '/icon-192x192.png',
  },
}


export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#0f172a'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pl" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/icon-192x192.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Studniówka 2026" />
      </head>
      <body className={inter.className} suppressHydrationWarning>
        {children}
        <Toaster position="top-center" />
      </body>
    </html>
  )
}
