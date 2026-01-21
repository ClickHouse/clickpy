#!/usr/bin/env bash
set -euo pipefail

# Usage function
usage() {
    cat << EOF
Usage: $0 [OPTIONS]

Fix PyPI data for a specific date by removing bad data and backfilling from S3.

OPTIONS:
    -d, --date DATE              Target date to fix (format: YYYY-MM-DD) [required]
    -h, --host HOST              ClickHouse host (default: localhost)
    -u, --user USER              ClickHouse user (default: default)
    -p, --password PASSWORD      ClickHouse password (default: empty)
    -k, --s3-key KEY             S3 Access Key [required]
    -s, --s3-secret SECRET       S3 Secret Key [required]
    --no-build-min-max           Skip rebuilding the min/max table (default: build it)
    -i, --interactive            Interactive mode - validate each query before execution
    --help                       Show this help message

EXAMPLES:
    $0 --date 2025-12-06 --s3-key MY_KEY --s3-secret MY_SECRET
    $0 -d 2025-12-06 -h my-host -u my-user -p my-pass -k MY_KEY -s MY_SECRET
    $0 --date 2025-12-06 --no-build-min-max
    $0 --date 2025-12-06 --interactive

EOF
    exit 1
}

# Default values
TARGET_DATE=""
CLICKHOUSE_HOST="localhost"
CLICKHOUSE_USER="default"
CLICKHOUSE_PASSWORD=""
CLICKHOUSE_DATABASE="pypi"
S3_KEY=""
S3_SECRET=""
BUILD_MIN_MAX=true
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
        --no-build-min-max)
            BUILD_MIN_MAX=false
            shift
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

echo "=== PyPI Data Fix Script ==="
echo "Target Date: $TARGET_DATE"
echo "ClickHouse Host: $CLICKHOUSE_HOST"
echo "ClickHouse User: $CLICKHOUSE_USER"
echo "Build Min/Max Table: $BUILD_MIN_MAX"
echo "Interactive Mode: $INTERACTIVE_MODE"
echo "============================"
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

# Calculate the Unix timestamp for the target date using ClickHouse
TARGET_TIMESTAMP=$(clickhouse-client ${CLICKHOUSE_CLIENT_OPTS} --query "SELECT CAST(CAST('${TARGET_DATE}', 'DateTime'), 'UInt64');")
echo "Target date: $TARGET_DATE (timestamp: $TARGET_TIMESTAMP)"

S3_COUNT=$(clickhouse-client ${CLICKHOUSE_CLIENT_OPTS} --query "
SELECT count()
FROM s3Cluster(
    'default',
    'https://storage.googleapis.com/clickhouse-pypi/file_downloads/incremental_v2/${TARGET_TIMESTAMP}-*.parquet',
    '${S3_KEY}',
    '${S3_SECRET}',
    'Parquet',
    'timestamp DateTime64(6), country_code LowCardinality(String), url String, project String, \`file.filename\` String, \`file.project\` String, \`file.version\` String, \`file.type\` String, \`installer.name\` String, \`installer.version\` String, python String, \`implementation.name\` String, \`implementation.version\` String, \`distro.name\` String, \`distro.version\` String, \`distro.id\` String, \`distro.libc.lib\` String, \`distro.libc.version\` String, \`system.name\` String, \`system.release\` String, cpu String, openssl_version String, setuptools_version String, rustc_version String, tls_protocol String, tls_cipher String'
);
")

# Check current table count before repair
CURRENT_COUNT=$(clickhouse-client ${CLICKHOUSE_CLIENT_OPTS} --query "
SELECT sum(count)
FROM ${CLICKHOUSE_DATABASE}.pypi_downloads_per_day
WHERE date = CAST('${TARGET_DATE}', 'Date32');
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
execute_query "Delete from pypi_downloads_per_day" \
    "ALTER TABLE ${CLICKHOUSE_DATABASE}.pypi_downloads_per_day DELETE WHERE date = CAST('${TARGET_DATE}', 'Date32');"

execute_query "Delete from pypi_downloads_per_day_by_version" \
    "ALTER TABLE ${CLICKHOUSE_DATABASE}.pypi_downloads_per_day_by_version DELETE WHERE date = CAST('${TARGET_DATE}', 'Date32');"

execute_query "Delete from pypi_downloads_per_day_by_version_by_system_by_country" \
    "ALTER TABLE ${CLICKHOUSE_DATABASE}.pypi_downloads_per_day_by_version_by_system_by_country DELETE WHERE date = CAST('${TARGET_DATE}', 'Date32');"

execute_query "Delete from pypi_downloads_per_day_by_version_by_country" \
    "ALTER TABLE ${CLICKHOUSE_DATABASE}.pypi_downloads_per_day_by_version_by_country DELETE WHERE date = CAST('${TARGET_DATE}', 'Date32');"

execute_query "Delete from pypi_downloads_per_day_by_version_by_file_type" \
    "ALTER TABLE ${CLICKHOUSE_DATABASE}.pypi_downloads_per_day_by_version_by_file_type DELETE WHERE date = CAST('${TARGET_DATE}', 'Date32');"

execute_query "Delete from pypi_downloads_per_day_by_version_by_installer_by_type" \
    "ALTER TABLE ${CLICKHOUSE_DATABASE}.pypi_downloads_per_day_by_version_by_installer_by_type DELETE WHERE date = CAST('${TARGET_DATE}', 'Date32');"

execute_query "Delete from pypi_downloads_per_day_by_version_by_installer_by_type_by_country" \
    "ALTER TABLE ${CLICKHOUSE_DATABASE}.pypi_downloads_per_day_by_version_by_installer_by_type_by_country DELETE WHERE date = CAST('${TARGET_DATE}', 'Date32');"

execute_query "Delete from pypi_downloads_per_day_by_version_by_python" \
    "ALTER TABLE ${CLICKHOUSE_DATABASE}.pypi_downloads_per_day_by_version_by_python DELETE WHERE date = CAST('${TARGET_DATE}', 'Date32');"

execute_query "Delete from pypi_downloads_per_day_by_version_by_python_by_country" \
    "ALTER TABLE ${CLICKHOUSE_DATABASE}.pypi_downloads_per_day_by_version_by_python_by_country DELETE WHERE date = CAST('${TARGET_DATE}', 'Date32');"

execute_query "Delete from pypi_downloads_per_day_by_version_by_system" \
    "ALTER TABLE ${CLICKHOUSE_DATABASE}.pypi_downloads_per_day_by_version_by_system DELETE WHERE date = CAST('${TARGET_DATE}', 'Date32');"

execute_query "Delete from pypi" \
    "ALTER TABLE ${CLICKHOUSE_DATABASE}.pypi DELETE WHERE date = CAST('${TARGET_DATE}', 'Date32');"

# Step 4: Drop materialized views
echo "=== Step 4: Drop materialized views ==="
execute_query "Drop materialized view pypi_downloads_per_month_mv" "DROP VIEW ${CLICKHOUSE_DATABASE}.pypi_downloads_per_month_mv;"
execute_query "Drop materialized view pypi_downloads_mv" "DROP VIEW ${CLICKHOUSE_DATABASE}.pypi_downloads_mv;"
execute_query "Drop materialized view pypi_downloads_max_min_mv" "DROP VIEW ${CLICKHOUSE_DATABASE}.pypi_downloads_max_min_mv;"

# Step 5: Backfill pypi for the day from S3
echo "=== Step 5: Backfill pypi table from S3 ==="


execute_long_query "Backfill pypi table from S3" "
INSERT INTO ${CLICKHOUSE_DATABASE}.pypi
SELECT
    CAST(timestamp, 'Date') AS date,
    country_code,
    project,
    file.type AS type,
    installer.name AS installer,
    arrayStringConcat(arraySlice(splitByChar('.', python), 1, 2), '.') AS python_minor,
    system.name AS system,
    file.version AS version
FROM s3Cluster(
    'default',
    'https://storage.googleapis.com/clickhouse-pypi/file_downloads/incremental_v2/${TARGET_TIMESTAMP}-*.parquet',
    '${S3_KEY}',
    '${S3_SECRET}',
    'Parquet',
    'timestamp DateTime64(6), country_code LowCardinality(String), url String, project String, \`file.filename\` String, \`file.project\` String, \`file.version\` String, \`file.type\` String, \`installer.name\` String, \`installer.version\` String, python String, \`implementation.name\` String, \`implementation.version\` String, \`distro.name\` String, \`distro.version\` String, \`distro.id\` String, \`distro.libc.lib\` String, \`distro.libc.version\` String, \`system.name\` String, \`system.release\` String, cpu String, openssl_version String, setuptools_version String, rustc_version String, tls_protocol String, tls_cipher String'
)
SETTINGS
    parallel_distributed_insert_select = 2,
    max_insert_threads = 8,
    input_format_null_as_default = 1,
    input_format_parquet_import_nested = 1;
" "Backfilling from S3 - this may take 5-10 minutes"


# Step 6: Quick check on the repaired day
echo "=== Step 6: Verify repaired data ==="
REPAIRED_COUNT=$(clickhouse-client ${CLICKHOUSE_CLIENT_OPTS} --query "
SELECT sum(count)
FROM ${CLICKHOUSE_DATABASE}.pypi_downloads_per_day
WHERE date = CAST('${TARGET_DATE}', 'Date32');
")
echo "Repaired data for ${TARGET_DATE}: $REPAIRED_COUNT records"
echo

# Step 7: Recreate materialized views
echo "=== Step 7: Recreate materialized views ==="

execute_query "Create pypi_downloads_per_month_mv" "
CREATE MATERIALIZED VIEW ${CLICKHOUSE_DATABASE}.pypi_downloads_per_month_mv
TO ${CLICKHOUSE_DATABASE}.pypi_downloads_per_month
(
    \`month\` Date,
    \`project\` String,
    \`count\` Int64
)
AS
SELECT
    toStartOfMonth(date) AS month,
    project,
    count() AS count
FROM ${CLICKHOUSE_DATABASE}.pypi
WHERE date > (toStartOfMonth(now()) - toIntervalMonth(6))
GROUP BY
    month,
    project;
"

execute_query "Create pypi_downloads_mv" "
CREATE MATERIALIZED VIEW ${CLICKHOUSE_DATABASE}.pypi_downloads_mv
TO ${CLICKHOUSE_DATABASE}.pypi_downloads
(
    \`project\` String,
    \`count\` Int64
)
AS
SELECT
    project,
    count() AS count
FROM ${CLICKHOUSE_DATABASE}.pypi
GROUP BY project;
"

execute_query "Create pypi_downloads_max_min_mv" "
CREATE MATERIALIZED VIEW ${CLICKHOUSE_DATABASE}.pypi_downloads_max_min_mv
TO pypi.pypi_downloads_max_min
(
    \`project\` String,
    \`max_date\` SimpleAggregateFunction(max, Date),
    \`min_date\` SimpleAggregateFunction(min, Date)
)
AS
SELECT
    project,
    maxSimpleState(date) AS max_date,
    minSimpleState(date) AS min_date
FROM ${CLICKHOUSE_DATABASE}.pypi
GROUP BY project;
"

# Step 8: Create shadow tables
echo "=== Step 8: Create shadow tables ==="
execute_query "Create pypi_downloads_per_month_v2" \
    "CREATE TABLE ${CLICKHOUSE_DATABASE}.pypi_downloads_per_month_v2 AS ${CLICKHOUSE_DATABASE}.pypi_downloads_per_month;"

execute_query "Create pypi_downloads_v2" \
    "CREATE TABLE ${CLICKHOUSE_DATABASE}.pypi_downloads_v2 AS ${CLICKHOUSE_DATABASE}.pypi_downloads;"

# Step 9: Rebuild aggregates into shadow tables and swap
echo "=== Step 9: Rebuild pypi_downloads aggregate ==="
execute_long_query "Rebuild pypi_downloads aggregate" "
INSERT INTO ${CLICKHOUSE_DATABASE}.pypi_downloads_v2
SELECT
    project,
    sum(count)
FROM ${CLICKHOUSE_DATABASE}.pypi_downloads_per_day
GROUP BY project;
" "Rebuilding aggregate table - this may take 2-5 minutes"


execute_query "Swap pypi_downloads tables" \
    "EXCHANGE TABLES ${CLICKHOUSE_DATABASE}.pypi_downloads_v2 AND ${CLICKHOUSE_DATABASE}.pypi_downloads;"

execute_query "Drop pypi_downloads_v2" \
    "DROP TABLE ${CLICKHOUSE_DATABASE}.pypi_downloads_v2;"

echo "=== Step 10: Rebuild pypi_downloads_per_month aggregate ==="
execute_long_query "Rebuild pypi_downloads_per_month aggregate" "
INSERT INTO ${CLICKHOUSE_DATABASE}.pypi_downloads_per_month_v2
SELECT
    toStartOfMonth(date) AS month,
    project,
    sum(count) AS count
FROM ${CLICKHOUSE_DATABASE}.pypi_downloads_per_day
GROUP BY
    month,
    project;
" "Rebuilding monthly aggregate - this may take 2-5 minutes"


execute_query "Swap pypi_downloads_per_month tables" \
    "EXCHANGE TABLES ${CLICKHOUSE_DATABASE}.pypi_downloads_per_month_v2 AND ${CLICKHOUSE_DATABASE}.pypi_downloads_per_month;"

execute_query "Drop pypi_downloads_per_month_v2" \
    "DROP TABLE ${CLICKHOUSE_DATABASE}.pypi_downloads_per_month_v2;"


# Conditionally rebuild min/max table
if [[ "$BUILD_MIN_MAX" == "true" ]]; then
    echo "=== Step 11: Rebuild pypi_downloads_max_min aggregate ==="
    
    execute_query "Create pypi_downloads_max_min_v2" \
        "CREATE TABLE ${CLICKHOUSE_DATABASE}.pypi_downloads_max_min_v2 AS ${CLICKHOUSE_DATABASE}.pypi_downloads_max_min;"
    
    execute_long_query "Rebuild pypi_downloads_max_min aggregate" "
    INSERT INTO ${CLICKHOUSE_DATABASE}.pypi_downloads_max_min_v2
    SELECT
        project,
        maxSimpleState(date) AS max_date,
        minSimpleState(date) AS min_date
    FROM ${CLICKHOUSE_DATABASE}.pypi
    GROUP BY project;
    " "Rebuilding min/max aggregate - this may take 10-15 minutes (largest table)"

    
    execute_query "Swap pypi_downloads_max_min tables" \
        "EXCHANGE TABLES ${CLICKHOUSE_DATABASE}.pypi_downloads_max_min_v2 AND ${CLICKHOUSE_DATABASE}.pypi_downloads_max_min;"
    
    execute_query "Drop pypi_downloads_max_min_v2" \
        "DROP TABLE ${CLICKHOUSE_DATABASE}.pypi_downloads_max_min_v2;"
else
    echo "=== Step 11: Skipping min/max table rebuild ==="
    echo "Skipping min/max table rebuild (no-build-min-max flag set)."
    echo
fi


# Final validation: Compare S3 source count with repaired data count
echo "=== Final Validation ==="
echo "Comparing S3 source data with repaired table data..."
echo ""

FINAL_COUNT=$(clickhouse-client ${CLICKHOUSE_CLIENT_OPTS} --query "
SELECT sum(count)
FROM ${CLICKHOUSE_DATABASE}.pypi_downloads_per_day
WHERE date = CAST('${TARGET_DATE}', 'Date32');
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
