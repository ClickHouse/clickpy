'use client';
import { useState } from 'react';
import { GoogleAnalytics } from '@next/third-parties/google';
import CookieBanner from '@/components/CookieBanner';
import { getCookieConsentValue } from 'react-cookie-consent';

export default function GAWithConsent({ children }) {
  const [hasConsent, setHasConsent] = useState(() => {
    return getCookieConsentValue("cookie-consent") === 'true';
  });

  return (
    <>
      {hasConsent && <GoogleAnalytics gaId="G-KF1LLRTQ5Q" />}
      {children}
      <CookieBanner setConsent={setHasConsent} />
    </>
  );
}