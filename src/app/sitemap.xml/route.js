import { clickhouse } from '@/utils/clickhouse';

export const MAX_PER_PAGE = 40000

async function totalSitemaps() {
  const request = await clickhouse.query({
    query: `SELECT countDistinct(name) AS total FROM rubygems.gem_downloads_total`,
  });
  const response = await request.json()
  const total = Number(response.data[0]?.total)
  if (!total || isNaN(total) || !isFinite(total)) return 0
  return Math.ceil(total / MAX_PER_PAGE)
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
