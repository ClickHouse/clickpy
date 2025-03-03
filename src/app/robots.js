 export default function robots(){
  return {
    rules: {
      userAgent: '*',
      allow: '/',
    },
    sitemap: 'https://clickpy.clickhouse.com/sitemap.xml',
  }
}