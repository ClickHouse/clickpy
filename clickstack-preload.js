// hyperdx-preload.cjs

// Load env vars from .env.local (if present)
require('dotenv').config({ path: '.env.local' });

const isDev = process.env.NODE_ENV === 'development';
const isProdRuntime =
  process.env.NODE_ENV === 'production' && process.env.VERCEL_ENV === 'production';

if (isDev || isProdRuntime) {
  try {
    require('@hyperdx/node-opentelemetry/build/src/tracing');
    console.log('[hyperdx-preload] HyperDX tracing enabled');
  } catch (err) {
    console.warn('[hyperdx-preload] Failed to load tracing module:', err.message);
  }
} else {
  console.log('[hyperdx-preload] Skipped (build phase or non-prod runtime)');
}
