/** @type {import('next').NextConfig} */
const nextConfig = {
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
