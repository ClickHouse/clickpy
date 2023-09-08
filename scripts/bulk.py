import os
import clickhouse_connect

# simple script to insert all available data upto 2023-06-16 into ClickHouse
# data after this date should be inserted via incremental.py script
client = clickhouse_connect.get_client(host=os.environ.get('CLICKHOUSE_HOST', 'localhost'),
                                       username=os.environ.get('CLICKHOUSE_USERNAME', 'default'),
                                       password=os.environ.get('CLICKHOUSE_PASSWORD', ''),
                                       port=int(os.environ.get('CLICKHOUSE_PORT', '8443')))
# this ensures a clear delineation between bulk and incremental - do not change
max_date = '2023-08-23'
i = 0
total = 0
while True:
    file_prefix = str(i).zfill(10)
    print(f"batch {file_prefix}")
    result = client.query(
        f"SELECT count() FROM s3('https://storage.googleapis.com/clickhouse_public_datasets/pypi/file_downloads/file_downloads-{file_prefix}*.parquet') ")
    count = result.result_rows[0][0]
    if count == 0:
        print(f'No more rows available - total: {total}')
        break
    total += count
    response = client.command(f"INSERT INTO pypi SELECT timestamp, country_code, url, project, (ifNull(file.filename, ''), ifNull(file.project, ''), ifNull(file.version, ''), ifNull(file.type, '')) AS file, " \
        f"(ifNull(installer.name, ''), ifNull(installer.version, '')) AS installer, python AS python, (ifNull(implementation.name, ''), ifNull(implementation.version, '')) AS implementation, " \
        f"(ifNull(distro.name, ''), ifNull(distro.version, ''), ifNull(distro.id, ''), (ifNull(distro.libc.lib, ''), ifNull(distro.libc.version, ''))) AS distro, (ifNull(system.name, ''), " \
        f"ifNull(system.release, '')) AS system, cpu AS cpu, openssl_version AS openssl_version, setuptools_version AS setuptools_version, rustc_version AS rustc_version, tls_protocol, " \
        f"tls_cipher, 'file_downloads-{file_prefix}*.parquet' AS _file FROM s3('https://storage.googleapis.com/clickhouse_public_datasets/pypi/file_downloads/file_downloads-{file_prefix}*.parquet', " \
        f"'Parquet', 'timestamp DateTime64(6), country_code LowCardinality(String), url String, project String, `file.filename` String, `file.project` String, `file.version` String, `file.type` String, " \
        f"`installer.name` String, `installer.version` String, python String, `implementation.name` String, `implementation.version` String, `distro.name` String, `distro.version` String, `distro.id` String, " \
        f"`distro.libc.lib` String, `distro.libc.version` String, `system.name` String, `system.release` String, cpu String, openssl_version String, setuptools_version String, rustc_version String,tls_protocol String, tls_cipher String')",
        settings={
            "input_format_null_as_default": 1,
            "input_format_parquet_import_nested": 1,
            "max_insert_block_size": 100000000,
            "min_insert_block_size_rows": 100000000,
            "min_insert_block_size_bytes": 500000000,
            "parts_to_throw_insert": 50000,
            "max_insert_threads": 16
        })
    print(response)
    print(total)
    break
    i += 1
