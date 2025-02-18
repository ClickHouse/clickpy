import type { MetadataRoute } from 'next'
import { createClient } from '@clickhouse/client';

export const clickhouse = createClient({
    host: process.env.CLICKHOUSE_HOST,
    username: process.env.CLICKHOUSE_USERNAME,
    password: process.env.CLICKHOUSE_PASSWORD,
    clickhouse_settings: {
        allow_experimental_analyzer: 0,
    }
});

const topProjectsQuery = `
SELECT
    project,
    sum(count) AS c
FROM pypi.pypi_downloads
GROUP BY project
ORDER BY c DESC
LIMIT 49999
`;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const resultSet = await clickhouse.query({
        query: topProjectsQuery,
        format: 'JSONEachRow'
    });
    const projects = []
    for await (const rows of resultSet.stream()) {
        rows.forEach(row => {
            projects.push(row.json()['project'])
        })
      }

    // Create dynamic sitemap entries based on the rows
    const dynamicEntries = projects.map(project => ({
        url: `https://clickpy.clickhouse.com/dashboard/project/${encodeURIComponent(project)}`,
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 0.7,
    }));

    // Simplified static entries for your sitemap
    const staticEntries = [
        {
            url: 'https://clickpy.clickhouse.com/dashboard/',
            lastModified: new Date(),
            changeFrequency: 'yearly',
            priority: 1,
        }
    ];

    return [...staticEntries, ...dynamicEntries];
}
