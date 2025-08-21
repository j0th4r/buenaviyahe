import type { Metadata } from 'next'
import { Bai_Jamjuree } from 'next/font/google'
import { Baloo_2 } from 'next/font/google'
import './globals.css'
import { AuthProvider } from '@/components/auth-provider'

// Initialize Bai Jamjuree font
const baiJamjuree = Bai_Jamjuree({ 
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-bai-jamjuree',
})

// Initialize Baloo 2 font
const baloo2 = Baloo_2({ 
  subsets: ['latin'],
  variable: '--font-baloo2',
})

export const metadata: Metadata = {
  title: 'Buena Viyahe',
  description: 'Buena Viyahe - Explore Buenavista',
  icons: {
    icon: [
      { url: '/favicon.ico' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
    shortcut: '/favicon.ico',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${baiJamjuree.className} ${baloo2.variable}`}>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  )
}
