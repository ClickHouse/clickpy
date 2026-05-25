export default function robots() {
  return {
    rules: {
      userAgent: '*',
      allow: ['/$', '/dashboard/*'],
      disallow: '/',
    },
    sitemap: 'https://clickpy.clickhouse.com/sitemap.xml',
  }
}
