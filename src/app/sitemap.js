import { getCrawlablePackageNames } from '@/utils/crawlable-packages';
import { SITE_URL } from '@/utils/site-metadata';

export const revalidate = 3600;

export default async function sitemap() {
    const projects = await getCrawlablePackageNames();

    const dynamicEntries = projects.map(project => ({
        url: `${SITE_URL}/dashboard/${encodeURIComponent(project)}`,
        changeFrequency: 'daily',
        priority: 0.7,
    }));

    const staticEntries = [
        {
            url: `${SITE_URL}/`,
            changeFrequency: 'yearly',
            priority: 1,
        },
    ];

    return [...staticEntries, ...dynamicEntries];
}
