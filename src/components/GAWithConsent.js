'use client';
import { useState, useEffect } from 'react';
import { GoogleAnalytics } from '@next/third-parties/google';
import { getCookieConsentValue } from 'react-cookie-consent';

export default function GAWithConsent({ children }) {
  const [hasConsent, setHasConsent] = useState(() => {
    return getCookieConsentValue("cookie-consent") === 'true';
  });

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
      {hasConsent && <GoogleAnalytics gaId="G-KF1LLRTQ5Q" />}
      {children}
    </>
  );
}