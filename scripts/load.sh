#!/bin/bash
# Check if the number of arguments is correct
if [ "$#" -ne 1 ]; then
    echo "Usage: $0 <num_batches>"
    exit 1
fi
CLICKHOUSE_HOST=${CLICKHOUSE_HOST:-localhost}
CLICKHOUSE_PORT=${CLICKHOUSE_PORT:-8443}
CLICKHOUSE_PASSWORD=${CLICKHOUSE_PASSWORD:-}

# Parse the arguments
num_batches="$1"

# Loop through and output the numbers in batches
for (( i=0; i<$num_batches; i++ )); do
    file=$(printf "%03d" $i)
    echo "batch: $file"
    nohup python load_files.py --host ${CLICKHOUSE_HOST} --port ${CLICKHOUSE_PORT} --username default --password ${CLICKHOUSE_PASSWORD} --file "files_${file}" --rows_per_batch 10000000 --database pypi --table pypi --cfg.format Parquet --cfg.structure "timestamp DateTime64(6), country_code LowCardinality(String), url String, project String, \`file.filename\` String, \`file.project\` String, \`file.version\` String, \`file.type\` String, \`installer.name\` String, \`installer.version\` String, python String, \`implementation.name\` String, \`implementation.version\` String, \`distro.name\` String, \`distro.version\` String, \`distro.id\` String, \`distro.libc.lib\` String, \`distro.libc.version\` String, \`system.name\` String, \`system.release\` String, cpu String, openssl_version String, setuptools_version String, rustc_version String,tls_protocol String, tls_cipher String" --cfg.select "SELECT timestamp::Date as date, country_code, project, file.type as type, installer.name as installer, arrayStringConcat(arraySlice(splitByChar('.', python), 1, 2), '.') as python_minor, system.name as system, file.version as version" --cfg.query_settings input_format_null_as_default=1 input_format_parquet_import_nested=1 max_insert_threads=1 min_insert_block_size_bytes=0 min_insert_block_size_rows=10_000_000 --cfg.staging_suffix "_staging_${i}" > "${i}.log" &
done
