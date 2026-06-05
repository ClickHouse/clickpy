/** @type {import('next').NextConfig} */
const nextConfig = {
  // Ignore otel pkgs warnings
  // https://github.com/open-telemetry/opentelemetry-js/issues/4173#issuecomment-1822938936
  webpack: (
    config,
    { buildId, dev, isServer, defaultLoaders, nextRuntime, webpack },
  ) => {
    if (isServer) {
      config.ignoreWarnings = [{ module: /opentelemetry/ }];
    }
    // echarts 5.5+ added an `exports` map with separate `import`/`require`
    // conditions, which lets the bundler load two distinct echarts instances —
    // echarts-countries-js registers the world map on one while
    // echarts-for-react renders from the other, so the country map on the
    // dashboard reads `regions` off an unregistered map and throws. Pin the
    // `echarts` specifier to a single resolved entry so the registry is shared.
    config.resolve.alias = {
      ...config.resolve.alias,
      echarts$: require.resolve('echarts'),
    };
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
