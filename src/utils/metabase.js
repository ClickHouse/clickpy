const METABASE_DASHBOARD_URLS = {
    getDownloadSummary: "https://clickhouse-analytics.metabaseapp.com/public/dashboard/8d516106-3a9f-4674-aafc-aa39d6380ee2",
    getDownloadsOverTime: "https://clickhouse-analytics.metabaseapp.com/public/dashboard/daa27bf9-c01e-43fe-9260-c69b679cfe83",
    getTopVersions: "https://clickhouse-analytics.metabaseapp.com/public/dashboard/2d90f54e-cf04-405b-ab52-b976b3be35a6",
    getDownloadsByCountry: "https://clickhouse-analytics.metabaseapp.com/public/dashboard/365e0045-2935-4fe3-a66f-4f8059261dc4",
    getDownloadsOverTimeByPython: "https://clickhouse-analytics.metabaseapp.com/public/dashboard/928efb6a-bb88-4522-a42a-e56131f49e5f",
    getDownloadsOverTimeBySystem: "https://clickhouse-analytics.metabaseapp.com/public/dashboard/49c7bfeb-8a6e-4422-960b-a7bbd37b1c96"
};

export function getMetabaseLink(name, packageName, theme='night') {
    if (typeof name !== "string") return null;
    let base = METABASE_DASHBOARD_URLS[name] ?? null;
  if (!base) return null;

  // Build query parameters according to the new rules
  let query = '';
  if (packageName) {
    // packageName provided – project_name must be the first parameter and its value must end with '#'
    query = `project_name=${encodeURIComponent(packageName)}#`;
  } else {
    // no packageName – append an empty package param that ends with '#'
    query = 'project_name=#';
  }

  // Always append the theme parameter after the project_name param
  query += `&theme=${encodeURIComponent(theme)}`;

  const sep = base.includes('?') ? '&' : '?';
  return `${base}${sep}${query}`;
}

