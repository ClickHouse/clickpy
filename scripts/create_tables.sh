#!/bin/bash

CLICKHOUSE_USER=${CLICKHOUSE_USER:-default}
CLICKHOUSE_HOST=${CLICKHOUSE_HOST:-localhost}
CLICKHOUSE_PASSWORD=${CLICKHOUSE_PASSWORD:-}

echo "dropping database"
clickhouse client --host ${CLICKHOUSE_HOST} --secure --password ${CLICKHOUSE_PASSWORD} --user ${CLICKHOUSE_USER} --query 'DROP DATABASE IF EXISTS pypi'
echo "creating database"
clickhouse client --host ${CLICKHOUSE_HOST} --secure --password ${CLICKHOUSE_PASSWORD} --user ${CLICKHOUSE_USER} --query 'CREATE DATABASE pypi'


echo "creating pypi table"
clickhouse client --host ${CLICKHOUSE_HOST} --secure --password ${CLICKHOUSE_PASSWORD} --user ${CLICKHOUSE_USER} --query '
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
'

echo "creating pypi_downloads view"

clickhouse client --host ${CLICKHOUSE_HOST} --secure --password ${CLICKHOUSE_PASSWORD} --user ${CLICKHOUSE_USER} --query '
CREATE TABLE pypi.pypi_downloads
(
    `project` String,
    `count` Int64
)
ENGINE = SummingMergeTree
ORDER BY project
'

clickhouse client --host ${CLICKHOUSE_HOST} --secure --password ${CLICKHOUSE_PASSWORD} --user ${CLICKHOUSE_USER} --query '
CREATE MATERIALIZED VIEW pypi.pypi_downloads_mv TO pypi.pypi_downloads
(
    `project` String,
    `count` Int64

) AS SELECT project, count() AS count
FROM pypi.pypi
GROUP BY project
'

echo "creating pypi_downloads_by_version view"

clickhouse client --host ${CLICKHOUSE_HOST} --secure --password ${CLICKHOUSE_PASSWORD} --user ${CLICKHOUSE_USER} --query '
CREATE TABLE pypi.pypi_downloads_by_version
(
    `project` String,
    `version` String,
    `count` Int64
)
ENGINE = SummingMergeTree
ORDER BY (project, version)
'

clickhouse client --host ${CLICKHOUSE_HOST} --secure --password ${CLICKHOUSE_PASSWORD} --user ${CLICKHOUSE_USER} --query '
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
'

echo "creating pypi_downloads_per_day view"

clickhouse client --host ${CLICKHOUSE_HOST} --secure --password ${CLICKHOUSE_PASSWORD} --user ${CLICKHOUSE_USER} --query '
CREATE TABLE pypi.pypi_downloads_per_day
(
    `date` Date,
    `project` String,
    `count` Int64
)
ENGINE = SummingMergeTree
ORDER BY (project, date)
'

clickhouse client --host ${CLICKHOUSE_HOST} --secure --password ${CLICKHOUSE_PASSWORD} --user ${CLICKHOUSE_USER} --query '
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
'

echo "creating pypi_downloads_per_day_by_version view"

clickhouse client --host ${CLICKHOUSE_HOST} --secure --password ${CLICKHOUSE_PASSWORD} --user ${CLICKHOUSE_USER} --query '
CREATE TABLE pypi.pypi_downloads_per_day_by_version
(
    `date` Date,
    `project` String,
    `version` String,
    `count` Int64
)
ENGINE = SummingMergeTree
ORDER BY (project, version, date)
'

clickhouse client --host ${CLICKHOUSE_HOST} --secure --password ${CLICKHOUSE_PASSWORD} --user ${CLICKHOUSE_USER} --query '
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
'


echo "creating pypi_downloads_per_day_by_version_by_country"

clickhouse client --host ${CLICKHOUSE_HOST} --secure --password ${CLICKHOUSE_PASSWORD} --user ${CLICKHOUSE_USER} --query '
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
'

clickhouse client --host ${CLICKHOUSE_HOST} --secure --password ${CLICKHOUSE_PASSWORD} --user ${CLICKHOUSE_USER} --query '
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
'


echo "creating pypi_downloads_per_day_by_version_by_file_type"

clickhouse client --host ${CLICKHOUSE_HOST} --secure --password ${CLICKHOUSE_PASSWORD} --user ${CLICKHOUSE_USER} --query '
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
'

clickhouse client --host ${CLICKHOUSE_HOST} --secure --password ${CLICKHOUSE_PASSWORD} --user ${CLICKHOUSE_USER} --query '
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
'

echo "creating pypi_downloads_per_day_by_version_by_python"

clickhouse client --host ${CLICKHOUSE_HOST} --secure --password ${CLICKHOUSE_PASSWORD} --user ${CLICKHOUSE_USER} --query '
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
'

clickhouse client --host ${CLICKHOUSE_HOST} --secure --password ${CLICKHOUSE_PASSWORD} --user ${CLICKHOUSE_USER} --query '
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
'

echo "creating pypi_downloads_per_day_by_version_by_installer_by_type"

clickhouse client --host ${CLICKHOUSE_HOST} --secure --password ${CLICKHOUSE_PASSWORD} --user ${CLICKHOUSE_USER} --query '
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
'

clickhouse client --host ${CLICKHOUSE_HOST} --secure --password ${CLICKHOUSE_PASSWORD} --user ${CLICKHOUSE_USER} --query '
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
'


echo "creating pypi_downloads_per_day_by_version_by_system"

clickhouse client --host ${CLICKHOUSE_HOST} --secure --password ${CLICKHOUSE_PASSWORD} --user ${CLICKHOUSE_USER} --query '
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
'


clickhouse client --host ${CLICKHOUSE_HOST} --secure --password ${CLICKHOUSE_PASSWORD} --user ${CLICKHOUSE_USER} --query '
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
'

echo "creating pypi_downloads_per_day_by_version_by_installer_by_type_by_country"

clickhouse client --host ${CLICKHOUSE_HOST} --secure --password ${CLICKHOUSE_PASSWORD} --user ${CLICKHOUSE_USER} --query '
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
'

clickhouse client --host ${CLICKHOUSE_HOST} --secure --password ${CLICKHOUSE_PASSWORD} --user ${CLICKHOUSE_USER} --query '
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
'

echo "creating pypi_downloads_per_day_by_version_by_python_by_country"

clickhouse client --host ${CLICKHOUSE_HOST} --secure --password ${CLICKHOUSE_PASSWORD} --user ${CLICKHOUSE_USER} --query '
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
'


clickhouse client --host ${CLICKHOUSE_HOST} --secure --password ${CLICKHOUSE_PASSWORD} --user ${CLICKHOUSE_USER} --query '
CREATE MATERIALIZED VIEW pypi.pypi_downloads_per_day_by_version_by_python_by_country_mv TO pypi.pypi_downloads_per_day_by_version_by_python_by_country
(
    `date` Date,
    `project` String,
    `version` String,
    `python_minor` String,
    `country_code` LowCardinality(String),
    `count` Int64
) AS
SELECT date, project, version,  python_minor, country_code, count() as count FROM pypi.pypi GROUP BY date, project, version, python_minor, country_code
'


echo "creating pypi_downloads_per_day_by_version_by_system_by_country"

clickhouse client --host ${CLICKHOUSE_HOST} --secure --password ${CLICKHOUSE_PASSWORD} --user ${CLICKHOUSE_USER} --query '
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
'


clickhouse client --host ${CLICKHOUSE_HOST} --secure --password ${CLICKHOUSE_PASSWORD} --user ${CLICKHOUSE_USER} --query '
CREATE MATERIALIZED VIEW pypi.pypi_downloads_per_day_by_version_by_system_by_country_mv TO pypi.pypi_downloads_per_day_by_version_by_system_by_country
(
    `date` Date,
    `project` String,
    `version` String,
    `system` String,
    `country_code` String,
    `count` Int64
) AS
SELECT date, project, version,  system, country_code, count() as count FROM pypi.pypi GROUP BY date, project, version, system, country_code
'

echo "creating pypi_downloads_max_min"

clickhouse client --host ${CLICKHOUSE_HOST} --secure --password ${CLICKHOUSE_PASSWORD} --user ${CLICKHOUSE_USER} --query '
CREATE TABLE pypi.pypi_downloads_max_min
(
    `project` String,
    `max_date` SimpleAggregateFunction(max, Date),
    `min_date` SimpleAggregateFunction(min, Date)
)
ENGINE = AggregatingMergeTree
ORDER BY project
'

clickhouse client --host ${CLICKHOUSE_HOST} --secure --password ${CLICKHOUSE_PASSWORD} --user ${CLICKHOUSE_USER} --query '
CREATE MATERIALIZED VIEW pypi.pypi_downloads_max_min_mv TO pypi.pypi_downloads_max_min
(
    `project` String,
    `max_date` SimpleAggregateFunction(max, Date),
    `min_date` SimpleAggregateFunction(min, Date)
) AS
SELECT project, maxSimpleState(date) as max_date, minSimpleState(date) FROM pypi.pypi GROUP BY project
'

echo "creating pypi_downloads_per_month"

clickhouse client --host ${CLICKHOUSE_HOST} --secure --password ${CLICKHOUSE_PASSWORD} --user ${CLICKHOUSE_USER} --query '
CREATE TABLE pypi.pypi_downloads_per_month
(
    `month` Date,
    `project` String,
    `count` Int64
)
ENGINE = SummingMergeTree
ORDER BY (month, project)
'


clickhouse client --host ${CLICKHOUSE_HOST} --secure --password ${CLICKHOUSE_PASSWORD} --user ${CLICKHOUSE_USER} --query '
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
FROM pypi
WHERE date > (toStartOfMonth(now()) - toIntervalMonth(3))
GROUP BY
    month,
    project
'


echo "creating projects table"

clickhouse client --host ${CLICKHOUSE_HOST} --secure --password ${CLICKHOUSE_PASSWORD} --user ${CLICKHOUSE_USER} --query '
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
'