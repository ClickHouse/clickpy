import { ClickUIProvider } from '@/click-ui';
import './globals.css';
import { Inter } from 'next/font/google';
import { GoogleAnalytics } from '@next/third-parties/google'
import { HighlightInit } from '@highlight-run/next/client'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'ClickPy',
  description: 'Python package analytics powered by ClickHouse',
}

export default function RootLayout({ children, summary }) {
  return (
    <>
      <HighlightInit
          projectId={'ve6137rg'}
          serviceName="ClickPy"
          tracingOrigins
          networkRecording={{
            enabled: true,
            recordHeadersAndBody: true,
            urlBlocklist: [],
          }}
        />
      <html lang='en' className='h-full antialiased'>
        <GoogleAnalytics gaId="G-KF1LLRTQ5Q" />
        <body className={`${inter.className} h-full`}>
          <ClickUIProvider theme="dark">{children}</ClickUIProvider>
        </body>
      </html>
    </>
  )
}
