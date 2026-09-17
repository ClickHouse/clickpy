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
      allow: [
        '/$',
        '/_next/',
        '/favicon.ico',
        '/*.svg',
        '/*.woff2',
        ...packages.map(dashboardRobotsPath),
      ],
      // Do not use /*? — Vercel serves /_next/*?dpl=... and that would
      // block the JS/CSS Googlebot needs to render the page.
      disallow: ['/dashboard/*?', '/'],
    },
    sitemap: 'https://clickgems.clickhouse.com/sitemap.xml',
  };
}
