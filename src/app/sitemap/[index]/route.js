import { CRAWLABLE_PACKAGE_LIMIT, getCrawlablePackageNames } from '@/utils/crawlable-packages';
import { MAX_PER_PAGE } from '@/app/sitemap.xml/route';

export async function GET(request, { params }) {
  const paramValues = await params
  const index = Number(paramValues.index)

  // Bail early if index is invalid or beyond the crawlable cap
  const offset = (index - 1) * MAX_PER_PAGE
  if (!index || isNaN(index) || !isFinite(index) || offset >= CRAWLABLE_PACKAGE_LIMIT) {
    return new Response('Not found', { status: 404 });
  }

  const packages = await getCrawlablePackageNames({
    offset,
    limit: Math.min(MAX_PER_PAGE, CRAWLABLE_PACKAGE_LIMIT - offset),
  })

  const entries = []

  if (index === 1) {
    entries.push(`<url>
	<loc>https://clickgems.clickhouse.com/</loc>
	<lastmod>${new Date().toISOString()}</lastmod>
	<changefreq>daily</changefreq>
	<priority>1.0</priority>
</url>`)
  }

  for (const packageName of packages) {
    entries.push(`<url>
    <loc>https://clickgems.clickhouse.com/dashboard/${encodeURIComponent(packageName)}</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.7</priority>
</url>`)
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
