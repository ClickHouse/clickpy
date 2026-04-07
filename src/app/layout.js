import { ClickUIProvider } from '@/click-ui';
import './globals.css';
import { Inter } from 'next/font/google';
import { GoogleTagManager } from '@next/third-parties/google';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'ClickGems',
  description: 'Gems package analytics powered by ClickHouse',
};

export default function RootLayout({ children }) {
  return (
    <html lang='en' className='h-full antialiased'>
      <GoogleTagManager gtmId="GTM-T55CC768" />
      <body className={`${inter.className} h-full`}>
        <ClickUIProvider theme="dark">
          {children}
        </ClickUIProvider>
      </body>
    </html>
  );
}
