import { ClickUIProvider } from '@/click-ui';
import './globals.css';
import { Inter } from 'next/font/google';
import Script from 'next/script';
import HyperDXInit from '@/components/HyperDXInit';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'ClickGems',
  description: 'Gems package analytics powered by ClickHouse',
};

export default function RootLayout({ children }) {
  return (
    <html lang='en' className='h-full antialiased'>
      {/* Google Tag Manager */}
      <Script
        id="gtm-script"
        strategy="beforeInteractive"
        dangerouslySetInnerHTML={{
          __html: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','GTM-T55CC768');`
        }}
      />
      {/* End Google Tag Manager */}

      <body className={`${inter.className} h-full`}>
        <ClickUIProvider theme="dark">
          <HyperDXInit>{children}</HyperDXInit>
        </ClickUIProvider>
      </body>
    </html>
  );
}
