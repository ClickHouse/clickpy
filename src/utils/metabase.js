


const METABASE_DASHBOARD_URLS = {

    getDownloadsOverTime: "https://rubygems-analytics.metabaseapp.com/public/dashboard/e7d49b39-014a-4cf7-b568-15dd7aca98c4",
    getTopVersions: "https://rubygems-analytics.metabaseapp.com/public/dashboard/3cb5ddbd-dc8a-4605-87ab-79475e180100",
    getDownloadsByCountry: "https://rubygems-analytics.metabaseapp.com/public/dashboard/ba2663af-de08-45fe-bd9c-6f4dba8b6f3a",
  

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

