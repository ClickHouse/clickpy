#!/usr/bin/env bash
set -euo pipefail

# Usage function
usage() {
    cat <<EOF
Usage: $0 [OPTIONS]

Fix RubyGems data for a specific date by removing bad data and backfilling from S3.

OPTIONS:
    -d, --date DATE              Target date to fix (format: YYYY-MM-DD) [required]
    -h, --host HOST              ClickHouse host (default: localhost)
    -u, --user USER              ClickHouse user (default: default)
    -p, --password PASSWORD      ClickHouse password (default: empty)
    -k, --s3-key KEY             S3 Access Key [required]
    -s, --s3-secret SECRET       S3 Secret Key [required]
    -i, --interactive            Interactive mode - validate each query before execution
    --help                       Show this help message

EXAMPLES:
    $0 --date 2025-12-26 --s3-key MY_KEY --s3-secret MY_SECRET
    $0 -d 2025-12-26 -h my-host -u my-user -p my-pass -k MY_KEY -s MY_SECRET
    $0 --date 2025-12-26 --interactive

EOF
    exit 1
}

# Default values
TARGET_DATE=""
CLICKHOUSE_HOST="localhost"
CLICKHOUSE_USER="default"
CLICKHOUSE_PASSWORD=""
CLICKHOUSE_DATABASE="rubygems"
S3_KEY=""
S3_SECRET=""
INTERACTIVE_MODE=false

# Parse command-line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        -d|--date)
            TARGET_DATE="$2"
            shift 2
            ;;
        -h|--host)
            CLICKHOUSE_HOST="$2"
            shift 2
            ;;
        -u|--user)
            CLICKHOUSE_USER="$2"
            shift 2
            ;;
        -p|--password)
            CLICKHOUSE_PASSWORD="$2"
            shift 2
            ;;
        -k|--s3-key)
            S3_KEY="$2"
            shift 2
            ;;
        -s|--s3-secret)
            S3_SECRET="$2"
            shift 2
            ;;
        -i|--interactive)
            INTERACTIVE_MODE=true
            shift
            ;;
        --help)
            usage
            ;;
        *)
            echo "Unknown option: $1"
            usage
            ;;
    esac
done

# Validate required parameters
if [[ -z "$TARGET_DATE" ]]; then
    echo "Error: Target date is required"
    usage
fi

if [[ -z "$S3_KEY" ]]; then
    echo "Error: S3 Access Key is required (-k/--s3-key)"
    usage
fi

if [[ -z "$S3_SECRET" ]]; then
    echo "Error: S3 Secret Key is required (-s/--s3-secret)"
    usage
fi

# Validate date format
if ! date -j -f "%Y-%m-%d" "$TARGET_DATE" > /dev/null 2>&1; then
    echo "Error: Invalid date format. Use YYYY-MM-DD"
    exit 1
fi

# Build ClickHouse client options
CLICKHOUSE_CLIENT_OPTS="--host $CLICKHOUSE_HOST --user $CLICKHOUSE_USER"
if [[ -n "$CLICKHOUSE_PASSWORD" ]]; then
    CLICKHOUSE_CLIENT_OPTS="$CLICKHOUSE_CLIENT_OPTS --password $CLICKHOUSE_PASSWORD"
fi

echo "=== RubyGems Data Fix Script ==="
echo "Target Date: $TARGET_DATE"
echo "ClickHouse Host: $CLICKHOUSE_HOST"
echo "ClickHouse User: $CLICKHOUSE_USER"
echo "Interactive Mode: $INTERACTIVE_MODE"
echo "==============================="
echo

# Helper function to execute ClickHouse queries with error checking
execute_query() {
    local step_name="$1"
    local query="$2"
    
    echo ">>> Step: $step_name"
    
    # Interactive mode: show query and ask for confirmation
    if [[ "$INTERACTIVE_MODE" == "true" ]]; then
        echo ""
        echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
        echo "Query to execute:"
        echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
        echo "$query" | sed 's/^/  /'
        echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
        echo ""
        
        while true; do
            read -p "Execute this query? [y]es / [n]o (skip) / [a]bort script: " -n 1 -r choice
            echo
            case $choice in
                [Yy])
                    echo "Executing..."
                    break
                    ;;
                [Nn])
                    echo "⊘ Skipped: $step_name"
                    echo
                    return 0
                    ;;
                [Aa])
                    echo "✗ Aborted by user"
                    exit 0
                    ;;
                *)
                    echo "Invalid choice. Please enter y, n, or a."
                    ;;
            esac
        done
    fi
    
    # Execute the query
    if clickhouse-client ${CLICKHOUSE_CLIENT_OPTS} --query "$query"; then
        echo "✓ Success: $step_name"
        echo
        return 0
    else
        echo "✗ Failed: $step_name"
        exit 1
    fi
}

# Helper function for long-running queries with interactive mode support
execute_long_query() {
    local step_name="$1"
    local query="$2"
    local description="${3:-This may take several minutes...}"
    
    echo ">>> Step: $step_name"
    
    # Interactive mode: show query and ask for confirmation
    if [[ "$INTERACTIVE_MODE" == "true" ]]; then
        echo ""
        echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
        echo "Query to execute:"
        echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
        echo "$query" | sed 's/^/  /'
        echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
        echo ""
        echo "⚠️  Note: $description"
        echo ""
        
        while true; do
            read -p "Execute this query? [y]es / [n]o (skip) / [a]bort script: " -n 1 -r choice
            echo
            case $choice in
                [Yy])
                    echo "Executing..."
                    break
                    ;;
                [Nn])
                    echo "⊘ Skipped: $step_name"
                    echo
                    return 0
                    ;;
                [Aa])
                    echo "✗ Aborted by user"
                    exit 0
                    ;;
                *)
                    echo "Invalid choice. Please enter y, n, or a."
                    ;;
            esac
        done
    else
        echo "$description"
    fi
    
    # Execute the query
    if clickhouse-client ${CLICKHOUSE_CLIENT_OPTS} --query "$query"; then
        echo "✓ Success: $step_name"
        echo
        return 0
    else
        echo "✗ Failed: $step_name"
        exit 1
    fi
}


# Step 1: Sanity check - record count in S3 batch
echo "=== Step 1: Sanity check - S3 batch record count ==="

# Parse the date components for the S3 path
# Data for a day can be stored in multiple days (one before and one after)
TARGET_YEAR=$(date -j -f "%Y-%m-%d" "$TARGET_DATE" "+%Y")
TARGET_MONTH=$(date -j -f "%Y-%m-%d" "$TARGET_DATE" "+%m")
TARGET_DAY=$(date -j -f "%Y-%m-%d" "$TARGET_DATE" "+%d")

# Calculate previous and next day for range
PREV_DATE=$(date -j -v-1d -f "%Y-%m-%d" "$TARGET_DATE" "+%Y-%m-%d")
NEXT_DATE=$(date -j -v+1d -f "%Y-%m-%d" "$TARGET_DATE" "+%Y-%m-%d")

PREV_YEAR=$(date -j -f "%Y-%m-%d" "$PREV_DATE" "+%Y")
PREV_MONTH=$(date -j -f "%Y-%m-%d" "$PREV_DATE" "+%m")
PREV_DAY=$(date -j -f "%Y-%m-%d" "$PREV_DATE" "+%d")

NEXT_YEAR=$(date -j -f "%Y-%m-%d" "$NEXT_DATE" "+%Y")
NEXT_MONTH=$(date -j -f "%Y-%m-%d" "$NEXT_DATE" "+%m")
NEXT_DAY=$(date -j -f "%Y-%m-%d" "$NEXT_DATE" "+%d")

# Build S3 path with date range
# Check if we're crossing month boundaries
if [[ "$PREV_MONTH" == "$TARGET_MONTH" && "$TARGET_MONTH" == "$NEXT_MONTH" ]]; then
    # All three days in same month
    S3_PATH="https://storage.googleapis.com/clickhouse-rubygems/incremental/${TARGET_YEAR}/${TARGET_MONTH}/{${PREV_DAY}..${NEXT_DAY}}/*.json.gz"
elif [[ "$PREV_MONTH" != "$TARGET_MONTH" && "$TARGET_MONTH" == "$NEXT_MONTH" ]]; then
    # Previous day in different month (beginning of month)
    S3_PATH="https://storage.googleapis.com/clickhouse-rubygems/incremental/{${PREV_YEAR}/${PREV_MONTH}/${PREV_DAY},${TARGET_YEAR}/${TARGET_MONTH}/{${TARGET_DAY}..${NEXT_DAY}}}/*.json.gz"
elif [[ "$PREV_MONTH" == "$TARGET_MONTH" && "$TARGET_MONTH" != "$NEXT_MONTH" ]]; then
    # Next day in different month (end of month)
    S3_PATH="https://storage.googleapis.com/clickhouse-rubygems/incremental/{${TARGET_YEAR}/${TARGET_MONTH}/{${PREV_DAY}..${TARGET_DAY}},${NEXT_YEAR}/${NEXT_MONTH}/${NEXT_DAY}}/*.json.gz"
else
    # All three days in different months (edge case: end of year)
    S3_PATH="https://storage.googleapis.com/clickhouse-rubygems/incremental/{${PREV_YEAR}/${PREV_MONTH}/${PREV_DAY},${TARGET_YEAR}/${TARGET_MONTH}/${TARGET_DAY},${NEXT_YEAR}/${NEXT_MONTH}/${NEXT_DAY}}/*.json.gz"
fi

echo "S3 Path: $S3_PATH"
echo "Date Range: $PREV_DATE to $NEXT_DATE"

S3_COUNT=$(clickhouse-client ${CLICKHOUSE_CLIENT_OPTS} --query "
SELECT count()
FROM s3Cluster(
    'default',
    '${S3_PATH}',
    '${S3_KEY}',
    '${S3_SECRET}',
    'JSONEachRow',
    'timestamp DateTime, request_path String, request_query String, user_agent Tuple(agent_name String, agent_version String, bundler String, ci String, command String, jruby String, options String, platform Tuple(cpu String, os String, version String), ruby String, rubygems String, truffleruby String), tls_cipher String, time_elapsed Int64, client_continent String, client_country String, client_region String, client_city String, client_latitude String, client_longitude String, client_timezone String, client_connection String, request String, request_host String, request_bytes Int64, http2 Bool, tls Bool, tls_version String, response_status Int64, response_text String, response_bytes Int64, response_cache String, cache_state String, cache_lastuse Float64, cache_hits Int64, server_region String, server_datacenter String, gem String, version String, platform String'
) where toDate(timestamp) = '${TARGET_DATE}';
")

# Check current table count before repair
CURRENT_COUNT=$(clickhouse-client ${CLICKHOUSE_CLIENT_OPTS} --query "
SELECT sum(count)
FROM ${CLICKHOUSE_DATABASE}.downloads_per_day
WHERE date = CAST('${TARGET_DATE}', 'Date');
")

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Initial State Check:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  S3 Source Records:       $S3_COUNT"
echo "  Current Table Count:     $CURRENT_COUNT"
echo "  Difference:              $((S3_COUNT - CURRENT_COUNT))"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

read -p "Continue? [y/n]: " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Aborted by user."
    exit 0
fi

echo

# Step 2: Set delete mode
echo "=== Step 2: Configure delete mode ==="
execute_query "Set lightweight delete mode" "SET lightweight_delete_mode='lightweight_update';"

# Step 3: Remove bad data for the day
echo "=== Step 3: Remove bad data for ${TARGET_DATE} ==="


execute_query "Delete from downloads_per_day" \
    "ALTER TABLE ${CLICKHOUSE_DATABASE}.downloads_per_day DELETE WHERE date = CAST('${TARGET_DATE}', 'Date');"

execute_query "Delete from downloads_per_day_by_version" \
    "ALTER TABLE ${CLICKHOUSE_DATABASE}.downloads_per_day_by_version DELETE WHERE date = CAST('${TARGET_DATE}', 'Date');"

execute_query "Delete from downloads_per_day_by_version_by_country" \
    "ALTER TABLE ${CLICKHOUSE_DATABASE}.downloads_per_day_by_version_by_country DELETE WHERE date = CAST('${TARGET_DATE}', 'Date');"

execute_query "Delete from downloads_per_day_by_version_by_platform" \
    "ALTER TABLE ${CLICKHOUSE_DATABASE}.downloads_per_day_by_version_by_platform DELETE WHERE date = CAST('${TARGET_DATE}', 'Date');"

execute_query "Delete from downloads_per_day_by_version_by_platform_by_country" \
    "ALTER TABLE ${CLICKHOUSE_DATABASE}.downloads_per_day_by_version_by_platform_by_country DELETE WHERE date = CAST('${TARGET_DATE}', 'Date');"

execute_query "Delete from downloads_per_day_by_version_by_ruby" \
    "ALTER TABLE ${CLICKHOUSE_DATABASE}.downloads_per_day_by_version_by_ruby DELETE WHERE date = CAST('${TARGET_DATE}', 'Date');"

execute_query "Delete from downloads_per_day_by_version_by_ruby_by_country" \
    "ALTER TABLE ${CLICKHOUSE_DATABASE}.downloads_per_day_by_version_by_ruby_by_country DELETE WHERE date = CAST('${TARGET_DATE}', 'Date');"

execute_query "Delete from downloads_per_day_by_version_by_system" \
    "ALTER TABLE ${CLICKHOUSE_DATABASE}.downloads_per_day_by_version_by_system DELETE WHERE date = CAST('${TARGET_DATE}', 'Date');"

execute_query "Delete from downloads_per_day_by_version_by_system_by_country" \
    "ALTER TABLE ${CLICKHOUSE_DATABASE}.downloads_per_day_by_version_by_system_by_country DELETE WHERE date = CAST('${TARGET_DATE}', 'Date');"

execute_query "Delete from downloads" \
    "ALTER TABLE ${CLICKHOUSE_DATABASE}.downloads DELETE WHERE toDate(timestamp) = CAST('${TARGET_DATE}', 'Date');"


# Step 4: Drop materialized view
echo "=== Step 4: Drop materialized view ==="
execute_query "Drop materialized view downloads_per_month_mv" "DROP VIEW ${CLICKHOUSE_DATABASE}.downloads_per_month_mv;"

# Step 5: Backfill downloads for the day from S3
echo "=== Step 5: Backfill downloads table from S3 ==="

execute_long_query "Backfill downloads table from S3" "
INSERT INTO ${CLICKHOUSE_DATABASE}.downloads
SELECT
    timestamp,
    request_path,
    request_query,
    user_agent,
    tls_cipher,
    time_elapsed,
    client_continent,
    client_country,
    client_region,
    client_city,
    client_latitude,
    client_longitude,
    client_timezone,
    client_connection,
    request,
    request_host,
    request_bytes,
    http2,
    tls,
    tls_version,
    response_status,
    response_text,
    response_bytes,
    response_cache,
    cache_state,
    cache_lastuse,
    cache_hits,
    server_region,
    server_datacenter,
    gem,
    version,
    platform
FROM s3Cluster(
    'default',
    '${S3_PATH}',
    '${S3_KEY}',
    '${S3_SECRET}',
    'JSONEachRow',
    'timestamp DateTime, request_path String, request_query String, user_agent Tuple(agent_name String, agent_version String, bundler String, ci String, command String, jruby String, options String, platform Tuple(cpu String, os String, version String), ruby String, rubygems String, truffleruby String), tls_cipher String, time_elapsed Int64, client_continent String, client_country String, client_region String, client_city String, client_latitude String, client_longitude String, client_timezone String, client_connection String, request String, request_host String, request_bytes Int64, http2 Bool, tls Bool, tls_version String, response_status Int64, response_text String, response_bytes Int64, response_cache String, cache_state String, cache_lastuse Float64, cache_hits Int64, server_region String, server_datacenter String, gem String, version String, platform String'
) where toDate(timestamp) = '${TARGET_DATE}'
SETTINGS
    parallel_distributed_insert_select = 2,
    max_insert_threads = 8,
    input_format_null_as_default = 1;
" "Backfilling from S3 - this may take 5-10 minutes"


# Step 6: Quick check on the repaired day
echo "=== Step 6: Verify repaired data ==="
REPAIRED_COUNT=$(clickhouse-client ${CLICKHOUSE_CLIENT_OPTS} --query "
SELECT sum(count)
FROM ${CLICKHOUSE_DATABASE}.downloads_per_day
WHERE date = CAST('${TARGET_DATE}', 'Date');
")
echo "Repaired data for ${TARGET_DATE}: $REPAIRED_COUNT records"
echo

# Step 7: Recreate materialized view
echo "=== Step 7: Recreate materialized view ==="

execute_query "Create downloads_per_month_mv" "
CREATE MATERIALIZED VIEW ${CLICKHOUSE_DATABASE}.downloads_per_month_mv TO ${CLICKHOUSE_DATABASE}.downloads_per_month
(
    \`month\` Date,
    \`gem\` String,
    \`count\` Int64
)
AS SELECT
    toStartOfMonth(timestamp) AS month,
    gem,
    count() AS count
FROM ${CLICKHOUSE_DATABASE}.downloads
GROUP BY
    month,
    gem;
"

# Step 8: Create shadow table
echo "=== Step 8: Create shadow table ==="
execute_query "Create downloads_per_month_v2" \
    "CREATE TABLE ${CLICKHOUSE_DATABASE}.downloads_per_month_v2 AS ${CLICKHOUSE_DATABASE}.downloads_per_month;"

# Step 9: Rebuild aggregate into shadow table and swap
echo "=== Step 9: Rebuild downloads_per_month aggregate ==="
execute_long_query "Rebuild downloads_per_month aggregate" "
INSERT INTO ${CLICKHOUSE_DATABASE}.downloads_per_month_v2
SELECT
    toStartOfMonth(date) AS month,
    gem,
    sum(count) AS count
FROM ${CLICKHOUSE_DATABASE}.downloads_per_day
GROUP BY
    month,
    gem;
" "Rebuilding monthly aggregate - this may take 2-5 minutes"


execute_query "Swap downloads_per_month tables" \
    "EXCHANGE TABLES ${CLICKHOUSE_DATABASE}.downloads_per_month_v2 AND ${CLICKHOUSE_DATABASE}.downloads_per_month;"

execute_query "Drop downloads_per_month_v2" \
    "DROP TABLE ${CLICKHOUSE_DATABASE}.downloads_per_month_v2;"


# Final validation: Compare S3 source count with repaired data count
echo "=== Final Validation ==="
echo "Comparing S3 source data with repaired table data..."
echo ""

FINAL_COUNT=$(clickhouse-client ${CLICKHOUSE_CLIENT_OPTS} --query "
SELECT sum(count)
FROM ${CLICKHOUSE_DATABASE}.downloads_per_day
WHERE date = CAST('${TARGET_DATE}', 'Date');
")

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Validation Results:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  S3 Source Records:     $S3_COUNT"
echo "  Repaired Table Count:  $FINAL_COUNT"
echo "  Target Date:           $TARGET_DATE"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if [ "$S3_COUNT" -eq "$FINAL_COUNT" ]; then
    echo "✓ SUCCESS: Counts match! Data repair completed successfully."
else
    echo "⚠ WARNING: Count mismatch detected!"
    echo "  Difference: $((FINAL_COUNT - S3_COUNT))"
    echo "  This may indicate an issue with the repair process."
fi
echo ""

echo "=== Script completed successfully ==="
