# PYPI table

```sql
CREATE TABLE pypi
(
    `timestamp` DateTime64(6),
    `date` Date MATERIALIZED timestamp,
    `country_code` LowCardinality(String),
    `url` String,
    `project` String,
    `file` Tuple(filename String, project String, version String, type Enum8('bdist_wheel' = 0, 'sdist' = 1, 'bdist_egg' = 2, 'bdist_wininst' = 3, 'bdist_dumb' = 4, 'bdist_msi' = 5, 'bdist_rpm' = 6, 'bdist_dmg' = 7)),
    `installer` Tuple(name LowCardinality(String), version LowCardinality(String)),
    `python` LowCardinality(String),
    `implementation` Tuple(name LowCardinality(String), version LowCardinality(String)),
    `distro` Tuple(name LowCardinality(String), version LowCardinality(String), id LowCardinality(String), libc Tuple(lib Enum8('' = 0, 'glibc' = 1, 'libc' = 2), version LowCardinality(String))),
    `system` Tuple(name LowCardinality(String), release String),
    `cpu` LowCardinality(String),
    `openssl_version` LowCardinality(String),
    `setuptools_version` LowCardinality(String),
    `rustc_version` LowCardinality(String),
    `tls_protocol` Enum8('TLSv1.2' = 0, 'TLSv1.3' = 1),
    `tls_cipher` LowCardinality(String),
    `_file` String
)
ENGINE = MergeTree
ORDER BY (project, date, version, country_code)

-- Inserting data example - see /scripts/bulk.py

 INSERT INTO pypi SELECT timestamp, country_code, url, project, (ifNull(file.filename, ''), ifNull(file.project, ''), ifNull(file.version, ''), ifNull(file.type, '')) AS file, (ifNull(installer.name, ''), ifNull(installer.version, '')) AS installer, python AS python, (ifNull(implementation.name, ''), ifNull(implementation.version, '')) AS implementation, (ifNull(distro.name, ''), ifNull(distro.version, ''), ifNull(distro.id, ''), (ifNull(distro.libc.lib, ''), ifNull(distro.libc.version, ''))) AS distro, (ifNull(system.name, ''), ifNull(system.release, '')) AS system, cpu AS cpu, openssl_version AS openssl_version, setuptools_version AS setuptools_version, rustc_version AS rustc_version, tls_protocol, tls_cipher, 'file_downloads-0000000000' AS _file FROM s3('https://storage.googleapis.com/clickhouse_public_datasets/pypi/file_downloads/file_downloads-0000000000*.parquet', 'Parquet', 'timestamp DateTime64(6), country_code LowCardinality(String), url String, project String, `file.filename` String, `file.project` String, `file.version` String, `file.type` String, `installer.name` String, `installer.version` String, python String, `implementation.name` String, `implementation.version` String, `distro.name` String, `distro.version` String, `distro.id` String, `distro.libc.lib` String, `distro.libc.version` String, `system.name` String, `system.release` String, cpu String, openssl_version String, setuptools_version String, rustc_version String,tls_protocol String, tls_cipher String') LIMIT 10  SETTINGS input_format_null_as_default = 1, input_format_parquet_import_nested = 1, max_insert_block_size = 100000000, min_insert_block_size_rows = 100000000, min_insert_block_size_bytes = 500000000, parts_to_throw_insert = 50000, max_insert_threads = 16
```



## Materialized views

### Downloads per day
```sql

CREATE TABLE pypi_downloads
(
    `project` String,
    `version` String,
    `_file` String,
    `count` Int64
)
ENGINE = SummingMergeTree
ORDER BY (project, version)


CREATE MATERIALIZED VIEW pypi_downloads_mv TO pypi_downloads
(
    `project` String,
    `version` String,
    `_file` String,
    `count` Int64

) AS
SELECT
    project,
    file.version AS version,
    any(_file) AS _file,
    count() AS count
FROM pypi
GROUP BY
    project,
    version


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
CREATE OR REPLACE TABLE pypi_file_types_by_installer
(
    `project` String,
    `version` String,
    `date` Date,
    `installer` String,
    `type` Enum8('bdist_wheel' = 0, 'sdist' = 1, 'bdist_egg' = 2, 'bdist_wininst' = 3, 'bdist_dumb' = 4, 'bdist_msi' = 5, 'bdist_rpm' = 6, 'bdist_dmg' = 7),
    `count` Int64
)
ENGINE = SummingMergeTree
ORDER BY (project, version, installer, date)


INSERT INTO pypi_file_types_by_installer SELECT
    project,
    file.version AS version,
    date,
    installer.name AS installer,
    file.type AS type,
    count() AS count
FROM pypi
GROUP BY
    project,
    version,
    date,
    installer,
    type
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