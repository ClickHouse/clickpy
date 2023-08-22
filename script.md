1. Login into Bigquery - show the public pypi table and schema
2. Show our table with 65b rows.
3. Explain the PYPI dataset - python downloads.

Confirm the count.


4. Start a GCE service (optional)

5. Switch to the existing ClickHouse Cloud service. Show we have the same data:

```sql
SHOW CREATE TABLE pypi

Select count(), min(date), max(date)  FROM pypi

```

6. Issue some queries:

Some queries to run:

### Top packages

#### Clickhouse
```sql
SELECT
    project,
    formatReadableQuantity(count()) AS c
FROM pypi
GROUP BY project
ORDER BY c DESC
LIMIT 6

```

#### BigQuery

```sql



```


### Downloads for a specific package

```sql
SELECT
    formatReadableQuantity(countIf(date > '2023-06-23'::Date32 - INTERVAL 1 DAY)) AS last_day,
    formatReadableQuantity(countIf(date > '2023-06-23'::Date32 - INTERVAL 1 WEEK)) AS last_week,
    formatReadableQuantity(countIf(date > '2023-06-23'::Date32 - INTERVAL 1 MONTH)) AS last_month,
    formatReadableQuantity(count()) AS total
FROM pypi
WHERE project = 'requests'
```

### Downloads over time

```sql
SELECT
    toStartOfDay(date) AS day,
    count() AS c, bar(c, 3000000, 15000000, 100) AS bar
FROM pypi
WHERE (project = 'requests') AND date > '2023-06-23'::Date32 - INTERVAL 1 MONTH
GROUP BY day
ORDER BY day ASC
FORMAT PrettyCompactMonoBlock
```


### Top versions for a package

```sql
SELECT
    file.version AS version,
    count() AS value
FROM pypi
WHERE (project = 'requests') 
GROUP BY version ORDER BY value DESC LIMIT 6

```

### Top Python versions

```sql

SELECT
    toStartOfWeek(date) AS week,
    arrayStringConcat(arraySlice(splitByChar('.', python), 1, 2), '.') AS python,
    count() AS c
FROM pypi
WHERE project = 'requests'
GROUP BY week, python
ORDER BY week ASC, c DESC
LIMIT 5 BY week
FORMAT PrettyCompactMonoBlock

```

### Top Python version over time

```sql

SELECT
    toStartOfWeek(date) AS week,
    arrayStringConcat(arraySlice(splitByChar('.', python), 1, 2), '.') AS python,
    count() AS c
FROM pypi
WHERE project = 'requests'
GROUP BY week, python
ORDER BY week ASC, c DESC
LIMIT 5 BY week
FORMAT PrettyCompactMonoBlock

```

Compare and contrast big query and clickhouse timings.



## Materialized views

These queries are fast, but real-time analytics apps typically need be faster. Materialized views enable this.

Consider this query which groups by week and python version, counting downloads.

We could imagine this as a multi-series line chart.

```
SELECT
    toStartOfWeek(date) AS week,
    arrayStringConcat(arraySlice(splitByChar('.', python), 1, 2), '.') AS python,
    count() AS c
FROM pypi
WHERE project = 'requests'
GROUP BY week, python
ORDER BY week ASC, c DESC
LIMIT 5 BY week
FORMAT PrettyCompactMonoBlock
```

Takes about 5.568 secs on our cluster, yeh fast, but if we wanna power an app likely we need faster.


Explain materialized views concept.


Show the following view, this simply counts the number of rows per package over time and by python version - sending the results to our pypi_downloads_per_day_by_python_version. We also group by package version.


```
CREATE MATERIALIZED VIEW pypi_downloads_per_day_by_python_version_mv TO pypi_downloads_per_day_by_python_version AS
SELECT
    date,
    project,
    file.version AS version,
    arrayStringConcat(arraySlice(splitByChar('.', python), 1, 2), '.') AS python,
    count() AS count
FROM pypi
GROUP BY
    project,
    version,
    date,
    python


```

At insert time the data goes to our views target table,

```sql
CREATE TABLE pypi_downloads_per_day_by_python_version
(
    `date` Date,
    `project` String,
    `version` String,
    `python` String,
    `count` Int64
)
ENGINE = SummingMergeTree
ORDER BY (project, version, date, python)
```


Note: materialized views cost us minimal storage and only some overhead at insert time. Almost free..unlike Snowflake.


Our query, can now be much faster..

```sql

SELECT
    toStartOfWeek(date) AS week,
    python,
    sum(count) AS c
FROM pypi_downloads_per_day_by_python_version
WHERE project = 'requests'
GROUP BY week, python
ORDER BY week ASC, c DESC
LIMIT 5 BY week
FORMAT PrettyCompactMonoBlock

```



## What about if we want to insert data?

We can export from bigquery as parquet - instructions in [query]()

We have exported the next day 24th june.


Show the data, note schema inference and the gcs function. Talk about how we can query data in place.


```sql

SELECT formatReadableQuantity(count()), max(timestamp), min(timestamp) FROM gcs('https://storage.googleapis.com/clickhouse_public_datasets/pypi/file_downloads/2023/06-24-*.parquet')

```

We have over half a billion rows. If we insert this (assuming min 720GB, 3 node cluster) this takes less than min


```sql

CREATE TABLE pypi_temp AS pypi 

INSERT INTO pypi_temp
SELECT
    timestamp,
    country_code,
    url,
    project,
    (ifNull(file.filename, ''), ifNull(file.project, ''), ifNull(file.version, ''), ifNull(file.type, '')) AS file,
    (ifNull(installer.name, ''), ifNull(installer.version, '')) AS installer,
    python AS python,
    (ifNull(implementation.name, ''), ifNull(implementation.version, '')) AS implementation,
    (ifNull(distro.name, ''), ifNull(distro.version, ''), ifNull(distro.id, ''), (ifNull(distro.libc.lib, ''), ifNull(distro.libc.version, ''))) AS distro,
    (ifNull(system.name, ''), ifNull(system.release, '')) AS system,
    cpu AS cpu,
    openssl_version AS openssl_version,
    setuptools_version AS setuptools_version,
    rustc_version AS rustc_version,
    tls_protocol,
    tls_cipher
FROM gcs('https://storage.googleapis.com/clickhouse_public_datasets/pypi/file_downloads/2023/06-24-*.parquet')
SETTINGS input_format_null_as_default = 1, input_format_parquet_import_nested = 1, max_insert_block_size = 100000000, min_insert_block_size_rows = 100000000, min_insert_block_size_bytes = 500000000, parts_to_throw_insert = 50000, max_insert_threads = 16


SELECT formatReadableQuantity(count()) FROM pypi_temp
```

Moving data between big query and clickhouse can be simple - and incremental using scheduled queries - see the blog.

## Show UI

All of this can power beautiful apps!