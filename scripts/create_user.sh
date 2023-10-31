#!/bin/bash
CLICKHOUSE_USER=${CLICKHOUSE_USER:-default}
CLICKHOUSE_HOST=${CLICKHOUSE_HOST:-localhost}
CLICKHOUSE_PASSWORD=${CLICKHOUSE_PASSWORD:-}

echo "creating user and roles"
clickhouse client --host ${CLICKHOUSE_HOST} --secure --password ${CLICKHOUSE_PASSWORD} --user ${CLICKHOUSE_USER} --query 'CREATE role play SETTINGS readonly = 1, add_http_cors_header = true, max_execution_time = 60.0, max_rows_to_read = 10000000000, max_bytes_to_read = 1000000000000, max_network_bandwidth = 25000000, max_memory_usage = 20000000000, max_bytes_before_external_group_by = 10000000000, max_result_rows = 1000, max_result_bytes = 10000000, result_overflow_mode = 'break', enable_http_compression = 1'

clickhouse client --host ${CLICKHOUSE_HOST} --secure --password ${CLICKHOUSE_PASSWORD} --user ${CLICKHOUSE_USER} --query 'CREATE USER play IDENTIFIED WITH double_sha1_hash BY 'BE1BDEC0AA74B4DCB079943E70528096CCA985F8' DEFAULT ROLE play SETTINGS enable_http_compression = 1 CHANGEABLE_IN_READONLY'

clickhouse client --host ${CLICKHOUSE_HOST} --secure --password ${CLICKHOUSE_PASSWORD} --user ${CLICKHOUSE_USER} --query 'GRANT SELECT ON pypi.* TO play'

clickhouse client --host ${CLICKHOUSE_HOST} --secure --password ${CLICKHOUSE_PASSWORD} --user ${CLICKHOUSE_USER} --query 'GRANT dictGet ON pypi.* TO play'
