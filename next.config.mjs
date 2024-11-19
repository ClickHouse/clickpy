import { withHighlightConfig } from '@highlight-run/next/config'
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
  experimental: {
		instrumentationHook: true,
	}
}

export default withHighlightConfig(nextConfig)
