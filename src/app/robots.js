import { dashboardRobotsPath, getCrawlablePackageNames } from '@/utils/crawlable-packages';

export const revalidate = 3600;

export default async function robots() {
  let packages = [];
  try {
    packages = await getCrawlablePackageNames();
  } catch (error) {
    console.error('Failed to load crawlable packages for robots.txt', error);
  }

  return {
    rules: {
      userAgent: '*',
      allow: ['/$', ...packages.map(dashboardRobotsPath)],
      disallow: ['/*?', '/'],
    },
    sitemap: 'https://clickpy.clickhouse.com/sitemap.xml',
  };
}
