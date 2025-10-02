import { getDependencies } from "./clickhouse";



const METABASE_DASHBOARD_URLS = {
    getDownloadSummary:
        "https://clickhouse-analytics.metabaseapp.com/public/dashboard/c5bee8e6-b76a-43fe-9082-96b9497d2278",
    getDownloadsOverTime: "https://clickhouse-analytics.metabaseapp.com/public/dashboard/e7d49b39-014a-4cf7-b568-15dd7aca98c4",
    getTopVersions: "https://clickhouse-analytics.metabaseapp.com/public/dashboard/3cb5ddbd-dc8a-4605-87ab-79475e180100",
    getDownloadsOverTimeBySystem: "https://clickhouse-analytics.metabaseapp.com/public/dashboard/970fd2a5-570a-48a0-805a-58f74707b589",
    getDependents: "https://clickhouse-analytics.metabaseapp.com/public/dashboard/6e1cdf2b-acd8-4112-88a7-06b39bdfa0de",
    getDownloadsByCountry: "https://clickhouse-analytics.metabaseapp.com/public/dashboard/ba2663af-de08-45fe-bd9c-6f4dba8b6f3a",
    getDownloadsOverTimeByRuby: "https://clickhouse-analytics.metabaseapp.com/public/dashboard/88cd933e-fd45-4a5e-a45b-3bd3e5d396d3",
    getDependencies: "https://clickhouse-analytics.metabaseapp.com/public/dashboard/5c7e6bed-af6e-436e-b297-0d493ec7dc76",
    getDependents: "https://clickhouse-analytics.metabaseapp.com/public/dashboard/09bb891c-4b07-4591-9ae7-fd1bdb90e9b1"

};

export function getMetabaseLink(name, packageName, theme='night') {
    if (typeof name !== "string") return null;
    let base = METABASE_DASHBOARD_URLS[name] ?? null;
  if (!base) return null;

  // Build query parameters according to the new rules
  let query = '';
  if (packageName) {
    // packageName provided – gem_name must be the first parameter and its value must end with '#'
    query = `gem_name=${encodeURIComponent(packageName)}#`;
  } else {
    // no packageName – append an empty gem param that ends with '#'
    query = 'gem=#';
  }

  // Always append the theme parameter after the gem/gem_name param
  query += `&theme=${encodeURIComponent(theme)}`;

  // Determine the separator – ensure gem/gem_name remains the first param
  const sep = base.includes('?') ? '&' : '?';
  return `${base}${sep}${query}`;
}

