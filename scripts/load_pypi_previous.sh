#!/bin/bash

# Get the current date in epoch format
current_date_epoch=$(date -u +%s)

# Calculate the number of seconds in a day (86400 seconds)
seconds_in_a_day=86400

# Calculate the previous day's date in epoch format
previous_day_epoch=$((current_date_epoch - seconds_in_a_day))

# Calculate the epoch timestamp for midnight UTC
midnight_utc_epoch=$((previous_day_epoch / seconds_in_a_day * seconds_in_a_day))

gsutil ls "gs://clickhouse-pypi/file_downloads/incremental/${midnight_utc_epoch}-*.parquet" | sed 's|gs://|https://storage.googleapis.com/|' > /opt/pypi/pypi-${midnight_utc_epoch}.txt

echo "scheduling pypi load"

python queue_files.py --host k5u1q15mc4.us-central1.gcp.clickhouse.cloud --port 8443 --username default --password 'DcqF~pz7h_FN5' --file "/opt/pypi/pypi-${midnight_utc_epoch}.txt" --task_database default --task_table tasks --files_chunk_size_min 500 --files_chunk_size_max 1000
