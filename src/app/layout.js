import './globals.css'
import { Inter } from 'next/font/google'
import Footer from '@/components/Footer';

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'ClickPy',
  description: 'Python package analytics powered by ClickHouse',
}

export default function RootLayout({ children, summary }) {
  return (
    <html lang='en' className='h-full antialiased'>
      <body className={`${inter.className} h-full`}>{children}</body>
    </html>
  )
}
