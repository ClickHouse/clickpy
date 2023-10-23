# Database

By default, ClickPy uses a `pypi` database.

```sql
CREATE DATABASE pypi
```

# PYPI table

By default we do not import all columns from the source data into ClickHouse, as most are not required for the application. We thus use the following configuation:

```sql

CREATE OR REPLACE TABLE pypi.pypi
(
    `date` Date,
    `country_code` LowCardinality(String),
    `project` String,
    `type` LowCardinality(String),
    `installer` LowCardinality(String),
    `python_minor` LowCardinality(String),
    `system` LowCardinality(String),
    `version` String
)
ENGINE = MergeTree
ORDER BY (project, date, version, country_code, python_minor, system)
```

## Materialized views

The following materialized views are required. Create these prior to data load.

### Downloads

```sql
CREATE TABLE pypi.pypi_downloads
(
    `project` String,
    `count` Int64
)
ENGINE = SummingMergeTree
ORDER BY project

CREATE MATERIALIZED VIEW pypi.pypi_downloads_mv TO pypi.pypi_downloads
(
    `project` String,
    `count` Int64

) AS SELECT project, count() AS count
FROM pypi.pypi
GROUP BY project
```

### Downloads by version

```sql
CREATE TABLE pypi.pypi_downloads_by_version
(
    `project` String,
    `version` String,
    `count` Int64
)
ENGINE = SummingMergeTree
ORDER BY (project, version)

CREATE MATERIALIZED VIEW pypi.pypi_downloads_by_version_mv TO pypi.pypi_downloads_by_version
(
    `project` String,
    `version` String,
    `count` Int64

) AS
SELECT
    project,
    version,
    count() AS count
FROM pypi.pypi
GROUP BY
    project,
    version
```

### Downloads per day

```sql
CREATE TABLE pypi.pypi_downloads_per_day
(
    `date` Date,
    `project` String,
    `count` Int64
)
ENGINE = SummingMergeTree
ORDER BY (project, date)

CREATE MATERIALIZED VIEW pypi.pypi_downloads_per_day_mv TO pypi.pypi_downloads_per_day
(
    `date` Date,
    `project` String,
    `count` Int64

) AS
SELECT
    date,
    project,
    count() AS count
FROM pypi.pypi
GROUP BY
    date,
    project
```

### Downloads per day by version

```sql
CREATE TABLE pypi.pypi_downloads_per_day_by_version
(
    `date` Date,
    `project` String,
    `version` String,
    `count` Int64
)
ENGINE = SummingMergeTree
ORDER BY (project, version, date)

CREATE MATERIALIZED VIEW pypi.pypi_downloads_per_day_by_version_mv TO pypi.pypi_downloads_per_day_by_version
(
    `date` Date,
    `project` String,
    `version` String,
    `count` Int64
) AS
SELECT
    date,
    project,
    version,
    count() AS count
FROM pypi.pypi
GROUP BY
    date,
    project,
    version
```

### Downloads per day by version by country

```sql
CREATE TABLE pypi.pypi_downloads_per_day_by_version_by_country
(
    `date` Date,
    `project` String,
    `version` String,
    `country_code` String,
    `count` Int64
)
ENGINE = SummingMergeTree
ORDER BY (project, version, date, country_code)

CREATE MATERIALIZED VIEW pypi.pypi_downloads_per_day_by_version_by_country_mv TO pypi.pypi_downloads_per_day_by_version_by_country
(
    `date` Date,
    `project` String,
    `version` String,
    `country_code` String,
    `count` Int64
) AS
SELECT
    date,
    project,
    version,
    country_code,
    count() AS count
FROM pypi.pypi
GROUP BY
    date,
    project,
    version,
    country_code
```

### Downloads per day by version by file type

```sql
CREATE TABLE pypi.pypi_downloads_per_day_by_version_by_file_type
(
    `date` Date,
    `project` String,
    `version` String,
    `type` LowCardinality(String),
    `count` Int64
)
ENGINE = SummingMergeTree
ORDER BY (project, version, date, type)

CREATE MATERIALIZED VIEW pypi.pypi_downloads_per_day_by_version_by_file_type_mv TO pypi.pypi_downloads_per_day_by_version_by_file_type
(
    `date` Date,
    `project` String,
    `version` String,
    `type` LowCardinality(String),
    `count` Int64
) AS
SELECT
    date,
    project,
    version,
    type,
    count() AS count
FROM pypi.pypi
GROUP BY
    date,
    project,
    version,
    type
```

### Downloads per day by version by python minor

```sql
CREATE TABLE pypi.pypi_downloads_per_day_by_version_by_python
(
    `date` Date,
    `project` String,
    `version` String,
    `python_minor` String,
    `count` Int64
)
ENGINE = SummingMergeTree
ORDER BY (project, version, date, python_minor)

CREATE MATERIALIZED VIEW pypi.pypi_downloads_per_day_by_version_by_python_mv TO pypi.pypi_downloads_per_day_by_version_by_python
(
    `date` Date,
    `project` String,
    `version` String,
    `python_minor` String,
    `count` Int64
) AS
SELECT
    date,
    project,
    version,
    python_minor,
    count() AS count
FROM pypi.pypi
GROUP BY
    date,
    project,
    version,
    python_minor
```

### Downloads per day by version by installer by type

```sql
CREATE OR REPLACE TABLE pypi.pypi_downloads_per_day_by_version_by_installer_by_type
(
    `project` String,
    `version` String,
    `date` Date,
    `installer` String,
    `type` LowCardinality(String),
    `count` Int64
)
ENGINE = SummingMergeTree
ORDER BY (project, version, date, installer)

CREATE MATERIALIZED VIEW pypi.pypi_downloads_per_day_by_version_by_installer_by_type_mv TO pypi.pypi_downloads_per_day_by_version_by_installer_by_type
(
    `project` String,
    `version` String,
    `date` Date,
    `installer` String,
    `type` LowCardinality(String),
    `count` Int64
) AS
SELECT
    project,
    version,
    date,
    installer,
    type,
    count() AS count
FROM pypi.pypi
GROUP BY
    project,
    version,
    date,
    installer,
    type
```

## Downloads per day by version by system

```sql
CREATE TABLE pypi.pypi_downloads_per_day_by_version_by_system
(
    `date` Date,
    `project` String,
    `version` String,
    `system` String,
    `count` Int64
)
ENGINE = SummingMergeTree
ORDER BY (project, version, date, system)

CREATE MATERIALIZED VIEW pypi.pypi_downloads_per_day_by_version_by_system_mv TO pypi.pypi_downloads_per_day_by_version_by_system
(
    `date` Date,
    `project` String,
    `version` String,
    `system` String,
    `count` Int64
) AS
SELECT
    date,
    project,
    version,
    system,
    count() AS count
FROM pypi.pypi
GROUP BY
    date,
    project,
    version,
    system
```

### Downloads per day by version by installer by type by country

```sql
CREATE TABLE pypi.pypi_downloads_per_day_by_version_by_installer_by_type_by_country
(
    `project` String,
    `version` String,
    `date` Date,
    `installer` String,
    `type` LowCardinality(String),
    `country_code` LowCardinality(String),
    `count` Int64
)
ENGINE = SummingMergeTree
ORDER BY (project, version, date, country_code, installer, type)


CREATE MATERIALIZED VIEW pypi.pypi_downloads_per_day_by_version_by_installer_by_type_by_country_mv TO pypi.pypi_downloads_per_day_by_version_by_installer_by_type_by_country
(
    `project` String,
    `version` String,
    `date` Date,
    `installer` String,
    `type` LowCardinality(String),
    `country_code` LowCardinality(String),
    `count` Int64
) AS
SELECT project, version, date, installer, type, country_code, count() as count
FROM pypi.pypi
GROUP BY project, version, date, installer, type, country_code
```

### Downloads per day by version by python minor by country

```sql
CREATE TABLE pypi.pypi_downloads_per_day_by_version_by_python_by_country
(
    `date` Date,
    `project` String,
    `version` String,
    `python_minor` String,
    `country_code` LowCardinality(String),
    `count` Int64
)
ENGINE = SummingMergeTree
ORDER BY (project, version, date, country_code, python_minor)

CREATE MATERIALIZED VIEW pypi.pypi_downloads_per_day_by_version_by_python_by_country_mv TO pypi.pypi_downloads_per_day_by_version_by_python_by_country
(
    `date` Date,
    `project` String,
    `version` String,
    `python_minor` String,
    `country_code` LowCardinality(String),
    `count` Int64
) AS
SELECT date, project, version,  python_minor, country_code, count() as count FROM pypi.pypi GROUP BY date, project, version,  python_minor, country_code
```

### Downloads per day by version by system by country


```sql
CREATE TABLE pypi.pypi_downloads_per_day_by_version_by_system_by_country
(
    `date` Date,
    `project` String,
    `version` String,
    `system` String,
    `country_code` String,
    `count` Int64
)
ENGINE = SummingMergeTree
ORDER BY (project, version, date, country_code, system)

CREATE MATERIALIZED VIEW pypi.pypi_downloads_per_day_by_version_by_system_by_country_mv TO pypi.pypi_downloads_per_day_by_version_by_system_by_country
(
    `date` Date,
    `project` String,
    `version` String,
    `system` String,
    `country_code` String,
    `count` Int64
) AS
SELECT date, project, version,  system, country_code, count() as count FROM pypi.pypi GROUP BY date, project, version,  system, country_code
```

### First and Last download 

```sql
CREATE TABLE pypi.pypi_downloads_max_min
(
    `project` String,
    `max_date` SimpleAggregateFunction(max, Date),
    `min_date` SimpleAggregateFunction(min, Date)
)
ENGINE = AggregatingMergeTree
ORDER BY project
```

```sql
CREATE MATERIALIZED VIEW pypi.pypi_downloads_max_min_mv TO pypi.pypi_downloads_max_min
(
    `project` String,
    `max_date` SimpleAggregateFunction(max, Date),
    `min_date` SimpleAggregateFunction(min, Date)
) AS
SELECT project, maxSimpleState(date) as max_date, minSimpleState(date) FROM pypi.pypi GROUP BY project
```

### Downloads per month (last 6 months)

```sql
CREATE TABLE pypi.pypi_downloads_per_month
(
    `month` Date,
    `project` String,
    `count` Int64
)
ENGINE = SummingMergeTree
ORDER BY (month, project)

CREATE MATERIALIZED VIEW pypi.pypi_downloads_per_month_mv TO pypi.pypi_downloads_per_month
(
    `month` Date,
    `project` String,
    `count` Int64
) AS
SELECT
    toStartOfMonth(date) AS month,
    project,
    count() AS count
FROM pypi.pypi
WHERE date > (toStartOfMonth(now()) - toIntervalMonth(6))
GROUP BY
    month,
    project
```

# Projects table

```sql
CREATE TABLE pypi.projects
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

Data is publicaly available for this table here:

```sql
INSERT INTO projects SELECT *
FROM s3('https://storage.googleapis.com/clickhouse_public_datasets/pypi/packages/packages-*.parquet')
```

# Dictionaries

The following dictionaries are required.

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
FROM url('https://gist.githubusercontent.com/gingerwizard/963e2aa7b0f65a3e8761ce2d413ba02c/raw/4b09800f48d932890eedd3ec5f7de380f2067947/country_codes.csv')

CREATE DICTIONARY countries_dict
(
    `name` String,
    `code` String
)
PRIMARY KEY code
SOURCE(CLICKHOUSE(TABLE 'countries'))
LIFETIME(MIN 0 MAX 300)
LAYOUT(COMPLEX_KEY_HASHED())

CREATE DICTIONARY pypi.last_updated_dict
(
    `name` String,
    `last_update` DateTime64(3)
)
PRIMARY KEY name
SOURCE(CLICKHOUSE(QUERY 'SELECT name, max(upload_time) AS last_update FROM pypi.projects GROUP BY name'))
LIFETIME(MIN 0 MAX 300)
LAYOUT(COMPLEX_KEY_HASHED())
```
