import { ClickUIProvider } from '@/click-ui';
import './globals.css';
import { Inter } from 'next/font/google';
import { GoogleTagManager } from '@next/third-parties/google';
import GalaxyInit from '@/components/GalaxyInit';

import { SITE_DESCRIPTION, SITE_TITLE, SITE_URL, siteSocialMetadata } from '@/utils/site-metadata';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  metadataBase: new URL(SITE_URL),
  title: SITE_TITLE,
  description: SITE_DESCRIPTION,
  ...siteSocialMetadata,
};

export default function RootLayout({ children }) {
  return (
    <html lang='en' className='h-full antialiased' data-cui-theme='dark'>
      <GoogleTagManager gtmId="GTM-T55CC768" />
      <body className={`${inter.className} h-full`}>
        <ClickUIProvider theme="dark" persistTheme={false}>
          <GalaxyInit />
          {children}
        </ClickUIProvider>
      </body>
    </html>
  );
}
