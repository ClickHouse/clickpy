import { clickhouse } from '@/utils/clickhouse';

// Keep this aligned with the sitemap. Googlebot is allowed to fetch
// only the homepage plus these package dashboards so crawl budget is
// not spent on the long tail of /dashboard/[package] URLs.
export const CRAWLABLE_PACKAGE_LIMIT = 100;

export async function getCrawlablePackageNames() {
  const resultSet = await clickhouse.query({
    query: `
SELECT
    project,
    sum(count) AS c
FROM pypi.pypi_downloads
GROUP BY project
ORDER BY c DESC
LIMIT {limit:UInt32}
`,
    query_params: { limit: CRAWLABLE_PACKAGE_LIMIT },
    format: 'JSONEachRow',
    // Sitemap prerender runs where the stateless-worker client is disabled.
    clickhouse_settings: {
      make_distributed_plan: 0,
      enable_parallel_replicas: 1,
    },
  });

  const projects = [];
  for await (const rows of resultSet.stream()) {
    rows.forEach((row) => {
      projects.push(row.json()['project']);
    });
  }
  return projects;
}

export function dashboardRobotsPath(packageName) {
  return `/dashboard/${encodeURIComponent(packageName)}$`;
}
