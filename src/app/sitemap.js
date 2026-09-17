import { getCrawlablePackageNames } from '@/utils/crawlable-packages';

export const revalidate = 3600;

export default async function sitemap() {
    const projects = await getCrawlablePackageNames();

    const dynamicEntries = projects.map(project => ({
        url: `https://clickpy.clickhouse.com/dashboard/${encodeURIComponent(project)}`,
        changeFrequency: 'daily',
        priority: 0.7,
    }));

    const staticEntries = [
        {
            url: 'https://clickpy.clickhouse.com/',
            changeFrequency: 'yearly',
            priority: 1,
        },
    ];

    return [...staticEntries, ...dynamicEntries];
}
