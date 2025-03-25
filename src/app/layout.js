import { ClickUIProvider } from '@/click-ui';
import './globals.css';
import './banner.css';
import './securiti.css'
import { Inter } from 'next/font/google';
import Script from 'next/script';
import GAWithConsent from '@/components/GAWithConsent';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'ClickPy',
  description: 'Python package analytics powered by ClickHouse',
};

export default function RootLayout({ children }) {
  return (
    <html lang='en' className='h-full antialiased'>
      <Script
        defer
        data-skip-css="false"
        src="https://cdn-prod.securiti.ai/consent/cookie-consent-sdk-loader-strict-csp.js"
        data-tenant-uuid="8555e54b-cd0b-45d7-9c1c-e9e088bf774a"
        data-domain-uuid="03e5394d-77f1-4eff-8ca4-f893359476e5"
        data-backend-url="https://app.securiti.ai"
      />

      <body className={`${inter.className} h-full`}>
        <ClickUIProvider theme="dark">
          <GAWithConsent>{children}</GAWithConsent>
        </ClickUIProvider>        
      </body>
    </html>
  );
}