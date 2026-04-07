import { ClickUIProvider } from '@/click-ui';
import './globals.css';
import { Inter } from 'next/font/google';
import { GoogleTagManager } from '@next/third-parties/google';
import HyperDXInit from '@/components/HyperDXInit';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'ClickPy',
  description: 'Python package analytics powered by ClickHouse',
  verification: {
      google: 'vu8LQ6LSMjSpZE8h8UlLByhNrhrrufGB6dlJ07hGCUA'
    }
};

export default function RootLayout({ children }) {
  return (
    <html lang='en' className='h-full antialiased'>
      <GoogleTagManager gtmId="GTM-T55CC768" />
      <body className={`${inter.className} h-full`}>
        <ClickUIProvider theme="dark">
          <HyperDXInit>{children}</HyperDXInit>
        </ClickUIProvider>
      </body>
    </html>
  );
}
