#!/bin/bash

CLICKHOUSE_USER=${CLICKHOUSE_USER:-default}
CLICKHOUSE_HOST=${CLICKHOUSE_HOST:-localhost}
CLICKHOUSE_PASSWORD=${CLICKHOUSE_PASSWORD:-}

midnight_utc_epoch=$(clickhouse client --host ${CLICKHOUSE_HOST} --secure --password ${CLICKHOUSE_PASSWORD} --user ${CLICKHOUSE_USER} --query "SELECT CAST(CAST(max(date) + toIntervalDay(1), 'DateTime'), 'Int64') FROM pypi.pypi_downloads_per_day")

gsutil ls "gs://clickhouse-pypi/file_downloads/incremental/${midnight_utc_epoch}-*.parquet" | sed 's|gs://|https://storage.googleapis.com/|' > /opt/pypi/pypi-${midnight_utc_epoch}.txt

echo "scheduling pypi load"

python3 queue_files.py --host ${CLICKHOUSE_HOST} --port 8443 --username ${CLICKHOUSE_USER} --password ${CLICKHOUSE_PASSWORD} --file "/opt/pypi/pypi-${midnight_utc_epoch}.txt" --task_database default --task_table tasks --files_chunk_size_min 500 --files_chunk_size_max 1000
