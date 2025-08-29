'use client';
import { useEffect } from 'react';
import HyperDX from '@hyperdx/browser';

export default function TelemetryProvider({ children }) {
  useEffect(() => {
    // Initialize browser instrumentation with environment variables
    HyperDX.init({
      url: process.env.NEXT_PUBLIC_OTEL_EXPORTER_OTLP_ENDPOINT || 'http://localhost:4318',
      apiKey: process.env.NEXT_PUBLIC_CLICKSTACK_INGESTION_API_KEY || '',
      service: 'clickpy-frontend',
    //   tracePropagationTargets: [
    //     new RegExp(process.env.NEXT_PUBLIC_DOMAIN || 'localhost', 'i'),
    //     /localhost:3000/i
    //   ],
      tracePropagationTargets: [/localhost/i],  
      consoleCapture: true,
      advancedNetworkCapture: true,
    });
  }, []);

  return children;
}
