export const SITE_URL = 'https://clickgems.clickhouse.com';
export const SITE_TITLE = 'ClickGems – RubyGems download stats and analytics';
export const SITE_DESCRIPTION =
  'ClickGems is a free RubyGems analytics service. Explore download trends for 200,000+ gems, powered by ClickHouse.';

export const siteSocialMetadata = {
  openGraph: {
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    url: SITE_URL,
    siteName: 'ClickGems',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
  },
};
