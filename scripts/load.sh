#!/bin/bash
# Check if the number of arguments is correct
if [ "$#" -ne 2 ]; then
    echo "Usage: $0 <num_workers> <worker_id_offset>"
    exit 1
fi
CLICKHOUSE_HOST=${CLICKHOUSE_HOST:-localhost}
CLICKHOUSE_PORT=${CLICKHOUSE_PORT:-8443}
CLICKHOUSE_PASSWORD=${CLICKHOUSE_PASSWORD:-}
ACCESS_KEY=${ACCESS_KEY:-}
SECRET_KEY=${SECRET_KEY:-}
# Parse the arguments
worker_id_start="$2"
num_workers="$1"

echo "starting $num_workers workers..."

num_workers=$((num_workers + worker_id_start))

# Loop through and output the numbers in batches
for (( i=$worker_id_start; i<$num_workers; i++ )); do
    echo "worker: $i"
    nohup python worker.py --host ${CLICKHOUSE_HOST} --port ${CLICKHOUSE_PORT} --username default --password ${CLICKHOUSE_PASSWORD} --task_database default --worker_id="worker_${i}" --task_table tasks --cfg.bucket_access_key ${ACCESS_KEY} --cfg.bucket_access_secret ${SECRET_KEY} --database pypi --table pypi --cfg.format Parquet --cfg.structure  "timestamp DateTime64(6), country_code LowCardinality(String), url String, project String, \`file.filename\` String, \`file.project\` String, \`file.version\` String, \`file.type\` String, \`installer.name\` String, \`installer.version\` String, python String, \`implementation.name\` String, \`implementation.version\` String, \`distro.name\` String, \`distro.version\` String, \`distro.id\` String, \`distro.libc.lib\` String, \`distro.libc.version\` String, \`system.name\` String, \`system.release\` String, cpu String, openssl_version String, setuptools_version String, rustc_version String,tls_protocol String, tls_cipher String" --cfg.select "SELECT timestamp::Date as date, country_code, project, file.type as type, installer.name as installer, arrayStringConcat(arraySlice(splitByChar('.', python), 1, 2), '.') as python_minor, system.name as system, file.version as version" --cfg.query_settings input_format_null_as_default=1 input_format_parquet_import_nested=1 max_insert_threads=1 min_insert_block_size_bytes=0 min_insert_block_size_rows=10_000_000 > "worker-${i}.log" 2>&1 &
done
