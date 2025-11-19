/** @type {import('next').NextConfig} */
const nextConfig = {
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
