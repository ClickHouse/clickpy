import { ClickUIProvider } from '@/click-ui';
import './globals.css';
import { Inter } from 'next/font/google';
import GAWithConsent from '@/components/GAWithConsent';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'ClickPy',
  description: 'Python package analytics powered by ClickHouse',
};

export default function RootLayout({ children }) {
  return (
    <html lang='en' className='h-full antialiased'>
      <body className={`${inter.className} h-full`}>
        <ClickUIProvider theme="dark">
        <GAWithConsent>{children}</GAWithConsent>
        </ClickUIProvider>
      </body>
    </html>
  );
}