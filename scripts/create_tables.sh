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
SELECT project, maxSimpleState(date) as max_date, minSimpleState(date) as min_date FROM pypi.pypi GROUP BY project
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
FROM pypi.pypi
WHERE date > (toStartOfMonth(now()) - toIntervalMonth(6))
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

echo "creating last_updated_dict dict"

clickhouse client --host ${CLICKHOUSE_HOST} --secure --password ${CLICKHOUSE_PASSWORD} --user ${CLICKHOUSE_USER} --query "CREATE DICTIONARY pypi.last_updated_dict
(
    name String,
    last_update DateTime64(3)
)
PRIMARY KEY name
SOURCE(CLICKHOUSE(QUERY 'SELECT name, max(upload_time) AS last_update FROM pypi.projects GROUP BY name'))
LIFETIME(MIN 0 MAX 300)
LAYOUT(COMPLEX_KEY_HASHED())"

echo "creating countries table & dict"

clickhouse client --host ${CLICKHOUSE_HOST} --secure --password ${CLICKHOUSE_PASSWORD} --user ${CLICKHOUSE_USER} --query 'CREATE TABLE pypi.countries
(
    name String,
    code String
)
ENGINE = MergeTree
ORDER BY code'

clickhouse client --host ${CLICKHOUSE_HOST} --secure --password ${CLICKHOUSE_PASSWORD} --user ${CLICKHOUSE_USER} --query "CREATE DICTIONARY pypi.countries_dict
(
    \`name\` String,
    \`code\` String
)
PRIMARY KEY code
SOURCE(CLICKHOUSE(DATABASE 'pypi' TABLE 'countries'))
LIFETIME(MIN 0 MAX 300)
LAYOUT(COMPLEX_KEY_HASHED())"

echo "populating countries"

clickhouse client --host ${CLICKHOUSE_HOST} --secure --password ${CLICKHOUSE_PASSWORD} --user ${CLICKHOUSE_USER} --query "INSERT INTO pypi.countries SELECT name, \`alpha-2\` AS code FROM url('https://gist.githubusercontent.com/gingerwizard/963e2aa7b0f65a3e8761ce2d413ba02c/raw/4b09800f48d932890eedd3ec5f7de380f2067947/country_codes.csv')"

echo "creating github tables"

echo "dropping database"
clickhouse client --host ${CLICKHOUSE_HOST} --secure --password ${CLICKHOUSE_PASSWORD} --user ${CLICKHOUSE_USER} --query 'DROP DATABASE IF EXISTS github'
echo "creating database"
clickhouse client --host ${CLICKHOUSE_HOST} --secure --password ${CLICKHOUSE_PASSWORD} --user ${CLICKHOUSE_USER} --query 'CREATE DATABASE github'

clickhouse client --host ${CLICKHOUSE_HOST} --secure --password ${CLICKHOUSE_PASSWORD} --user ${CLICKHOUSE_USER} --query '
CREATE TABLE github.github_events
(
    `file_time` DateTime,
    `event_type` Enum8('CommitCommentEvent' = 1, 'CreateEvent' = 2, 'DeleteEvent' = 3, 'ForkEvent' = 4, 'GollumEvent' = 5, 'IssueCommentEvent' = 6, 'IssuesEvent' = 7, 'MemberEvent' = 8, 'PublicEvent' = 9, 'PullRequestEvent' = 10, 'PullRequestReviewCommentEvent' = 11, 'PushEvent' = 12, 'ReleaseEvent' = 13, 'SponsorshipEvent' = 14, 'WatchEvent' = 15, 'GistEvent' = 16, 'FollowEvent' = 17, 'DownloadEvent' = 18, 'PullRequestReviewEvent' = 19, 'ForkApplyEvent' = 20, 'Event' = 21, 'TeamAddEvent' = 22),
    `actor_login` LowCardinality(String),
    `repo_name` LowCardinality(String),
    `repo_id` LowCardinality(String),
    `created_at` DateTime,
    `updated_at` DateTime,
    `action` Enum8('none' = 0, 'created' = 1, 'added' = 2, 'edited' = 3, 'deleted' = 4, 'opened' = 5, 'closed' = 6, 'reopened' = 7, 'assigned' = 8, 'unassigned' = 9, 'labeled' = 10, 'unlabeled' = 11, 'review_requested' = 12, 'review_request_removed' = 13, 'synchronize' = 14, 'started' = 15, 'published' = 16, 'update' = 17, 'create' = 18, 'fork' = 19, 'merged' = 20),
    `comment_id` UInt64,
    `body` String,
    `path` String,
    `position` Int32,
    `line` Int32,
    `ref` LowCardinality(String),
    `ref_type` Enum8('none' = 0, 'branch' = 1, 'tag' = 2, 'repository' = 3, 'unknown' = 4),
    `creator_user_login` LowCardinality(String),
    `number` UInt32,
    `title` String,
    `labels` Array(LowCardinality(String)),
    `state` Enum8('none' = 0, 'open' = 1, 'closed' = 2),
    `locked` UInt8,
    `assignee` LowCardinality(String),
    `assignees` Array(LowCardinality(String)),
    `comments` UInt32,
    `author_association` Enum8('NONE' = 0, 'CONTRIBUTOR' = 1, 'OWNER' = 2, 'COLLABORATOR' = 3, 'MEMBER' = 4, 'MANNEQUIN' = 5),
    `closed_at` DateTime,
    `merged_at` DateTime,
    `merge_commit_sha` String,
    `requested_reviewers` Array(LowCardinality(String)),
    `requested_teams` Array(LowCardinality(String)),
    `head_ref` LowCardinality(String),
    `head_sha` String,
    `base_ref` LowCardinality(String),
    `base_sha` String,
    `merged` UInt8,
    `mergeable` UInt8,
    `rebaseable` UInt8,
    `mergeable_state` Enum8('unknown' = 0, 'dirty' = 1, 'clean' = 2, 'unstable' = 3, 'draft' = 4, 'blocked' = 5),
    `merged_by` LowCardinality(String),
    `review_comments` UInt32,
    `maintainer_can_modify` UInt8,
    `commits` UInt32,
    `additions` UInt32,
    `deletions` UInt32,
    `changed_files` UInt32,
    `diff_hunk` String,
    `original_position` UInt32,
    `commit_id` String,
    `original_commit_id` String,
    `push_size` UInt32,
    `push_distinct_size` UInt32,
    `member_login` LowCardinality(String),
    `release_tag_name` String,
    `release_name` String,
    `review_state` Enum8('none' = 0, 'approved' = 1, 'changes_requested' = 2, 'commented' = 3, 'dismissed' = 4, 'pending' = 5)
)
ENGINE = MergeTree
ORDER BY (repo_id, event_type, created_at)
'

clickhouse client --host ${CLICKHOUSE_HOST} --secure --password ${CLICKHOUSE_PASSWORD} --user ${CLICKHOUSE_USER} --query '
CREATE TABLE github.repo_name_to_id
(
    `repo_name` String,
    `repo_id` String
)
ENGINE = ReplacingMergeTree
ORDER BY repo_name
'

clickhouse client --host ${CLICKHOUSE_HOST} --secure --password ${CLICKHOUSE_PASSWORD} --user ${CLICKHOUSE_USER} --query '
CREATE MATERIALIZED VIEW github.repo_name_to_id_mv TO github.repo_name_to_id
(
    `repo_name` String,
    `repo_id` String
)
AS SELECT
    repo_name,
    any(repo_id) AS repo_id
FROM github.github_events
GROUP BY repo_name
'

echo "done"
