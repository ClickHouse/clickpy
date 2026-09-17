import { clickhouse } from '@/utils/clickhouse';

// Keep this aligned with the sitemap. Googlebot is allowed to fetch
// only the homepage plus these gem dashboards so crawl budget is not
// spent on the long tail of /dashboard/[package] URLs.
export const CRAWLABLE_PACKAGE_LIMIT = 100;

export async function getCrawlablePackageNames({
  offset = 0,
  limit = CRAWLABLE_PACKAGE_LIMIT,
} = {}) {
  const resultSet = await clickhouse.query({
    query: `
SELECT
    name,
    sum(count) AS c
FROM rubygems.gem_downloads_total
GROUP BY name
ORDER BY c DESC
LIMIT {limit:UInt32}
OFFSET {offset:UInt32}
`,
    query_params: { limit, offset },
    format: 'JSONEachRow',
  });

  const names = [];
  for await (const rows of resultSet.stream()) {
    rows.forEach((row) => {
      names.push(row.json()['name']);
    });
  }
  return names;
}

export function dashboardRobotsPath(packageName) {
  return `/dashboard/${encodeURIComponent(packageName)}$`;
}
