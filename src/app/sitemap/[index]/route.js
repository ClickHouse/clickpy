import { clickhouse } from '@/utils/clickhouse';
import { MAX_PER_PAGE } from '@/app/sitemap.xml/route';

export async function GET(request, { params }) {
  const paramValues = await params
  const index = Number(paramValues.index)

  // Bail early if index is invalid
  if (!index || isNaN(index) || !isFinite(index)) {
    return new Response('Not found', { status: 404 });
  }

  const resultSet = await clickhouse.query({
    query: `SELECT
    name,
    sum(count) AS c
FROM rubygems.gem_downloads_total
GROUP BY name
ORDER BY c DESC
LIMIT ${MAX_PER_PAGE}
OFFSET ${(index - 1) * MAX_PER_PAGE}`,
    format: 'JSONEachRow'
  });

  const entries = []
  for await (const rows of resultSet.stream()) {
    rows.forEach(row => {
      const packageName = row.json()['name']
      entries.push(`<url>
	<loc>https://clickgems.clickhouse.com/dashboard/${packageName}</loc>
	<lastmod>${new Date().toISOString()}</lastmod>
	<changefreq>daily</changefreq>
	<priority>0.7</priority>
</url>`)
    })
  }

  if (!entries.length) {
    return new Response('Not found', { status: 404 });
  }

  return new Response(`<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries.join(`\n`)}
</urlset>`, {
    headers: { 'Content-Type': 'text/xml' },
  })
}
