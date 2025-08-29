// export async function register() {
//   if (process.env.NEXT_RUNTIME === 'nodejs') {
//     const { init } = await import('@hyperdx/node-opentelemetry');
//     init({
//       apiKey: process.env.NEXT_PUBLIC_CLICKSTACK_INGESTION_API_KEY, // optionally configure via `HYPERDX_API_KEY` env var
//       service: 'clickpy', // optionally configure via `OTEL_SERVICE_NAME` env var
//       additionalInstrumentations: [], // optional, default: [],
//       url: process.env.NEXT_PUBLIC_OTEL_EXPORTER_OTLP_ENDPOINT
//     });
//   }
// }


import { registerOTel } from '@vercel/otel'
 
export function register() {
  registerOTel({ serviceName: 'clickpy' })
}
