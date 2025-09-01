/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: '/dashboard',
        destination: '/',
      },
    ];
  },

  experimental: {
    outputFileTracingIncludes: {
      '*': ['./clickstack-preload.js'],
    },
  },
};

module.exports = nextConfig;
