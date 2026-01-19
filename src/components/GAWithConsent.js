'use client';
import { useState, useEffect } from 'react';
import { GoogleTagManager } from '@next/third-parties/google';
import HyperDX from '@hyperdx/browser';


HyperDX.init({
  url: process.env.NEXT_PUBLIC_OTEL_EXPORTER_OTLP_ENDPOINT || 'http://localhost:4318',
  apiKey: process.env.NEXT_PUBLIC_HYPERDX_API_KEY || '',
  service: 'clickpy-frontend',
  tracePropagationTargets: [
    /localhost:\d+/i,
    new RegExp(process.env.NEXT_PUBLIC_DOMAIN || 'localhost', 'i')
  ],
  consoleCapture: true,
  advancedNetworkCapture: true,
});

export default function GAWithConsent({ children }) {
  const [hasConsent, setHasConsent] = useState(false);

  useEffect(() => {
    const handleMessageEvent = (event) => {
      // Securiti.ai cookies accepted event
      if (event.data.message === 'consent_given') {
        setHasConsent(true)
      }
    }

    window.addEventListener('message', handleMessageEvent)
  }, [])

  return (
    <>
      {hasConsent && <GoogleTagManager gtmId="GTM-T55CC768" />}
      {children}
    </>
  );
}