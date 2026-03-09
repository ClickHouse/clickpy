import { clickhouse } from '@/utils/clickhouse';

export const MAX_PER_PAGE = 500
const SITEMAP_CAP = 500

async function totalSitemaps() {
  return Math.ceil(SITEMAP_CAP / MAX_PER_PAGE)
}

export async function GET() {

  const total = await totalSitemaps()
  const sitemaps = []

  for (let i = 1; i <= total; i++) {
    sitemaps.push(`<sitemap><loc>https://clickgems.clickhouse.com/sitemap-${i}.xml</loc></sitemap>`)
  }

  return new Response(
    `<?xml version="1.0" encoding="UTF-8"?>
  <sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
	${sitemaps.join(`\n`)}
</sitemapindex>`,
    {
      headers: { 'Content-Type': 'text/xml' },
    },
  )
}
