```sql

CREATE TABLE default.pypi_downloads_per_day
(
    `date` Date,
    `project` String,
    `version` String,
    `count` Int64
)
ENGINE = MergeTree
ORDER BY (project, version, date)


INSERT INTO pypi_downloads_per_day SELECT
    date,
    project,
    file.version as version,
    count() AS count
FROM pypi
GROUP BY
    project,
    version,
    date
```


```sql
CREATE TABLE pypi_downloads
(
    `project` String,
    `count` Int64,
    `version` String
)
ENGINE = SummingMergeTree
ORDER BY (project, version)


INSERT INTO pypi_downloads SELECT
    project,
    version,
    count() AS count
FROM pypi
GROUP BY
    project,
    file.version AS version

```

```sql

CREATE TABLE default.pypi_downloads_per_day_by_file_type
(
    `date` Date,
    `project` String,
    `version` String,
    `type` Enum8('bdist_wheel' = 0, 'sdist' = 1, 'bdist_egg' = 2, 'bdist_wininst' = 3, 'bdist_dumb' = 4, 'bdist_msi' = 5, 'bdist_rpm' = 6, 'bdist_dmg' = 7),
    `count` Int64
)
ENGINE = SummingMergeTree
ORDER BY (project, version, date, type)


INSERT INTO pypi_downloads_per_day_by_file_type SELECT
    date,
    project,
    file.version AS version,
    file.type AS type,
    count() AS count
FROM pypi
GROUP BY
    project,
    version,
    date,
    type
```


```sql
CREATE TABLE default.pypi_downloads_per_day_by_python_version
(
    `date` Date,
    `project` String,
    `version` String,
    `python` String,
    `count` Int64
)
ENGINE = SummingMergeTree
ORDER BY (project, version, date, python)

INSERT INTO pypi_downloads_per_day_by_python_version SELECT
    date,
    project,
    file.version AS version,
    arrayStringConcat(arraySlice(splitByChar('.', python), 1, 2), '.') AS python,
    count() AS count
FROM pypi
GROUP BY
    project,
    version,
    date,
    python

```
```sql
CREATE TABLE default.pypi_downloads_per_day_by_system
(
    `date` Date,
    `project` String,
    `version` String,
    `system` String,
    `count` Int64
)
ENGINE = SummingMergeTree
ORDER BY (project, version, date, system)

INSERT INTO pypi_downloads_per_day_by_system SELECT
    date,
    project,
    file.version AS version,
    system.name AS system,
    count() AS count
FROM pypi
GROUP BY
    project,
    version,
    date,
    system
```

```sql

CREATE TABLE default.pypi_downloads_per_day_by_country
(
    `date` Date,
    `project` String,
    `version` String,
    `country_code` String,
    `count` Int64
)
ENGINE = SummingMergeTree
ORDER BY (project, version, date, country_code)


INSERT INTO pypi_downloads_per_day_by_country SELECT
    date,
    project,
    file.version AS version,
    country_code,
    count() AS count
FROM pypi
GROUP BY
    project,
    version,
    date,
    country_code


```

```sql

CREATE TABLE countries
(
    `name` String,
    `code` String
)
ENGINE = MergeTree
ORDER BY code


INSERT INTO countries SELECT
    name,
    `alpha-2` AS code
FROM url('https://gist.githubusercontent.com/gingerwizard/963e2aa7b0f65a3e8761ce2d413ba02c/raw/9bbe636240616e8ee1cc3a75122cf79ac0854bab/country_codes.csv')

CREATE DICTIONARY countries_dict
(
    `name` String,
    `code` String
)
PRIMARY KEY code
SOURCE(CLICKHOUSE(TABLE 'countries'))
LIFETIME(MIN 0 MAX 300)
LAYOUT(COMPLEX_KEY_HASHED())

```


```sql

CREATE TABLE packages
(
    `metadata_version` String,
    `name` String,
    `version` String,
    `summary` String,
    `description` String,
    `description_content_type` String,
    `author` String,
    `author_email` String,
    `maintainer` String,
    `maintainer_email` String,
    `license` String,
    `keywords` String,
    `classifiers` Array(String),
    `platform` Array(String),
    `home_page` String,
    `download_url` String,
    `requires_python` String,
    `requires` Array(String),
    `provides` Array(String),
    `obsoletes` Array(String),
    `requires_dist` Array(String),
    `provides_dist` Array(String),
    `obsoletes_dist` Array(String),
    `requires_external` Array(String),
    `project_urls` Array(String),
    `uploaded_via` String,
    `upload_time` DateTime64,
    `filename` String,
    `size` Int64,
    `path` String,
    `python_version` String,
    `packagetype` String,
    `comment_text` String,
    `has_signature` Bool,
    `md5_digest` String,
    `sha256_digest` String,
    `blake2_256_digest` String
)
ENGINE = MergeTree
ORDER BY name

```