#!/bin/bash

# Get the current date in epoch format
current_date_epoch=$(date -u +%s)

# Calculate the number of seconds in a day (86400 seconds)
seconds_in_a_day=86400

# Calculate the previous day's date in epoch format
previous_day_epoch=$((current_date_epoch - seconds_in_a_day))

# Calculate the epoch timestamp for midnight UTC
midnight_utc_epoch=$((previous_day_epoch / seconds_in_a_day * seconds_in_a_day))

CLICKHOUSE_USER=${CLICKHOUSE_USER:-default}
CLICKHOUSE_HOST=${CLICKHOUSE_HOST:-localhost}
CLICKHOUSE_PASSWORD=${CLICKHOUSE_PASSWORD:-}
ACCESS_KEY=${ACCESS_KEY:-}
SECRET_KEY=${SECRET_KEY:-}


echo "loading projects data"

projects_file_path="https://storage.googleapis.com/clickhouse-pypi/packages/${midnight_utc_epoch}/*.parquet"

echo "creating temp packages table"
clickhouse client --host ${CLICKHOUSE_HOST} --secure --password ${CLICKHOUSE_PASSWORD} --user ${CLICKHOUSE_USER} --query "CREATE TABLE pypi.projects_v2 AS pypi.projects"

echo "inserting into temp"

clickhouse client --host ${CLICKHOUSE_HOST} --secure --password ${CLICKHOUSE_PASSWORD} --user ${CLICKHOUSE_USER} --query "INSERT INTO pypi.projects_v2 SELECT * FROM s3('${projects_file_path}', '${ACCESS_KEY}','${SECRET_KEY}') SETTINGS max_insert_threads=16"

echo "exchanging tables"

clickhouse client --host ${CLICKHOUSE_HOST} --secure --password ${CLICKHOUSE_PASSWORD} --user ${CLICKHOUSE_USER} --query "EXCHANGE TABLES pypi.projects AND pypi.projects_v2"

echo "dropping old temp"

clickhouse client --host ${CLICKHOUSE_HOST} --secure --password ${CLICKHOUSE_PASSWORD} --user ${CLICKHOUSE_USER} --query "DROP TABLE pypi.projects_v2"
