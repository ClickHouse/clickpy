/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    instrumentationHook: true,
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
