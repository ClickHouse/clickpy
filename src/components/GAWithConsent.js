'use client';
import { useState, useEffect } from 'react';
import { GoogleTagManager } from '@next/third-parties/google';

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