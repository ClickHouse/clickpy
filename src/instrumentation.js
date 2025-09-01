export async function register() {
    if (process.env.NEXT_RUNTIME === 'nodejs') {
      const { initSDK } = await import('@hyperdx/node-opentelemetry');
      initSDK({
        additionalInstrumentations: [],
        advancedNetworkCapture: true// optional, default: []
      });
    }
}
