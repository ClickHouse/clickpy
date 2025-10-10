 export default function robots(){
  return {
    rules: {
      userAgent: '*',
      allow: '/',
    },
    sitemap: 'https://clickgems.clickhouse.com/sitemap.xml',
  }
}
