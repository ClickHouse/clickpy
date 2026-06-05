/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config) => {
    // echarts 5.5+ added an `exports` map with separate `import` (index.js)
    // and `require` (dist/echarts.js) conditions. That lets the bundler pull
    // two distinct echarts instances — echarts-countries-js registers the
    // world map on one while echarts-for-react renders from the other, so the
    // map series reads `regions` off an unregistered map and throws. Pin every
    // `echarts` specifier to a single resolved entry so the map registry is
    // shared.
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
      },
      {
        source: '/sitemap-:index(\\d{1,}).xml',
        destination: '/sitemap/:index',
      },
    ]
  },
}

module.exports = nextConfig
