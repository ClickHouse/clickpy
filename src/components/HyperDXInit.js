'use client';
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

export default function HyperDXInit({ children }) {
  return <>{children}</>;
}
