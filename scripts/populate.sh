#!/bin/bash

CLICKHOUSE_HOST=${CLICKHOUSE_HOST:-localhost}
CLICKHOUSE_USER=${CLICKHOUSE_USER:-default}
CLICKHOUSE_PASSWORD=${CLICKHOUSE_PASSWORD:-}


clickhouse client --host ${CLICKHOUSE_HOST} --secure --user ${CLICKHOUSE_USER} --password ${CLICKHOUSE_PASSWORD} --query '
INSERT INTO countries SELECT
    name,
    `alpha-2` AS code
FROM url('https://gist.githubusercontent.com/gingerwizard/963e2aa7b0f65a3e8761ce2d413ba02c/raw/4b09800f48d932890eedd3ec5f7de380f2067947/country_codes.csv')
'
