export default function PackageSchema({
  name,
  authors,
  licenses,
  summary,
  home_page,
  max_version,
  repo_name
}) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": name,
    "applicationCategory": "DeveloperApplication",
    "operatingSystem": "Cross-platform",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD"
    }
  };

  if (summary) {
    schema.description = summary;
  }

  if (authors) {
    const authorList = authors.split(',').map(a => a.trim()).filter(a => a);
    if (authorList.length === 1) {
      schema.author = {
        "@type": "Person",
        "name": authorList[0]
      };
    } else if (authorList.length > 1) {
      schema.author = authorList.map(author => ({
        "@type": "Person",
        "name": author
      }));
    }
  }

  if (licenses) {
    schema.license = licenses.trim();
  }

  if (home_page) {
    schema.url = home_page;
  }

  if (repo_name) {
    schema.codeRepository = `https://github.com/${repo_name}`;
  }

  if (max_version) {
    schema.softwareVersion = max_version;
  }

  schema.downloadUrl = `https://rubygems.org/gems/${name}`;
  schema.installUrl = `https://rubygems.org/gems/${name}`;

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
