/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    instrumentationHook: true,
  },
  // Ignore otel pkgs warnings 
  // https://github.com/open-telemetry/opentelemetry-js/issues/4173#issuecomment-1822938936
  webpack: (
    config,
    { buildId, dev, isServer, defaultLoaders, nextRuntime, webpack },
  ) => {
    if (isServer) {
      config.ignoreWarnings = [{ module: /opentelemetry/ }];
    }
    return config;
  },
  async rewrites() {
    return [
      {
        source: '/dashboard',
        destination: '/'
      }
    ]
  },
}

module.exports = nextConfig
