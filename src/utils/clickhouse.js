import { createClient } from '@clickhouse/client'

export const clickhouse = createClient({
    host: process.env.CLICKHOUSE_HOST,
    username: process.env.CLICKHOUSE_USERNAME,
    password: process.env.CLICKHOUSE_PASSWORD,
})

const PYPI_DATABASE = process.env.PYPI_DATABASE || 'pypi'
const PYPI_TABLE = process.env.PYPI_TABLE || 'pypi.pypi'
const materialized_views = [
    { columns: ['project'], table: 'pypi_downloads' },
    { columns: ['project', 'version'], table: 'pypi_downloads_by_version' },
    { columns: ['project', 'date'], table: 'pypi_downloads_per_day' },
    { columns: ['project', 'date', 'version'], table: 'pypi_downloads_per_day_by_version' },
    { columns: ['project', 'date', 'version', 'country_code'], table: 'pypi_downloads_per_day_by_version_by_country' },
    { columns: ['project', 'date', 'version', 'python_minor'], table: 'pypi_downloads_per_day_by_version_by_python' }, 
    { columns: ['project', 'date', 'version', 'python_minor', 'country_code'], table: 'pypi_downloads_per_day_by_version_by_python_by_country' },
    { columns: ['project', 'date', 'version', 'system'], table: 'pypi_downloads_per_day_by_version_by_system' },
    { columns: ['project', 'date', 'version', 'system', 'country_code'], table: 'pypi_downloads_per_day_by_version_by_system_by_country' },
    { columns: ['project', 'date', 'version', 'installer', 'type'], table: 'pypi_downloads_per_day_by_version_by_installer_by_type' },
    { columns: ['project', 'date', 'version', 'installer', 'type', 'country_code'], table: 'pypi_downloads_per_day_by_version_by_installer_by_type_by_country' },
    { columns: ['project', 'date', 'version', 'type'], table: 'pypi_downloads_per_day_by_version_by_type' },
    { columns: ['project','max_date', 'min_date'], table: 'pypi_downloads_max_min' },
]

// based on required columns we identify the most optimal mv to query - this is the smallest view (least columns) which covers all required columns 
function findOptimalTable(required_columns) {

    const candidates = materialized_views.filter(value => {
        if (value.columns.length >= required_columns.length) {
            // are all required columns in the candidate
            if (required_columns.every(column => value.columns.includes(column))){
                return true
            }
        }
        return false
    })
    let table = PYPI_TABLE
    if (candidates.length > 0) {
        // best match is shortest
        table = candidates.reduce((a,b) => a.columns.length <= b.columns.length ? a: b).table
    }
    return table
}

export async function getPackages(query_prefix) {
    if (query_prefix != '') { 
        const res = await query('getPackages',`SELECT project, sum(count) AS c FROM ${PYPI_DATABASE}.${findOptimalTable(['project'])} WHERE project LIKE {query_prefix:String} GROUP BY project ORDER BY c DESC LIMIT 6`, {
                query_prefix: `${query_prefix.toLowerCase().trim()}%`
            }
        )
        return res
    }
    return []
}

export async function getTotalDownloads() {
    const results = await query('getTotalDownloads',`SELECT
        formatReadableQuantity(sum(count)) AS total, uniqExact(project) as projects FROM ${PYPI_DATABASE}.${findOptimalTable(['project'])}`)
    return results[0]
}

export async function getDownloadSummary(package_name, version, min_date, max_date, country_code) {
    const columns = ['project', 'date']
    if (version) {  columns.push('version') }
    if (country_code) { columns.push('country_code') }
    const table = findOptimalTable(columns)
    return query('getDownloadSummary',`SELECT sumIf(count, date >= {min_date:String}::Date32 AND date >= {max_date:String}::Date32 - toIntervalDay(1) AND date <= {max_date:String}::Date32) AS last_day,
    sumIf(count, date >= {min_date:String}::Date32 AND date >= {max_date:String}::Date32 - toIntervalWeek(1) AND date <= {max_date:String}::Date32) AS last_week,
    sumIf(count, date >= {min_date:String}::Date32 AND date >= {max_date:String}::Date32 - toIntervalMonth(1) AND date <= {max_date:String}::Date32) AS last_month,
    sumIf(count, date >= {min_date:String}::Date32 AND date >= {min_date:String}::Date32 AND date <= {max_date:String}::Date32) AS total
    FROM ${PYPI_DATABASE}.${table} WHERE (project = {package_name:String}) AND ${version ? `version={version:String}`: '1=1'} AND ${country_code ? `country_code={country_code:String}`: '1=1'}`,
    {
        min_date: min_date,
        max_date: max_date,
        package_name: package_name,
        version: version,
        country_code: country_code,
    })
}

export async function getProjectCount() {
    return query('getProjectCount',`SELECT
        project,
        sum(count) AS c
    FROM ${PYPI_DATABASE}.${findOptimalTable(['project'])}
    GROUP BY project
    ORDER BY c DESC
    LIMIT 5`)
}

export async function getRecentPackageDownloads(package_name) {
    return query('getRecentPackageDownloads',`WITH (
        SELECT max(date) AS max_date
        FROM ${PYPI_DATABASE}.${findOptimalTable(['project', 'date'])}
        WHERE project = {package_name:String}
    ) AS max_date
    SELECT
        toStartOfWeek(date) AS x,
        sum(count) AS y
    FROM ${PYPI_DATABASE}.${findOptimalTable(['project', 'date'])}
    WHERE (project = {package_name:String}) AND (date > (max_date - toIntervalWeek(12)))
    GROUP BY x
    ORDER BY x ASC`, {
        package_name: package_name
    })
}

export async function getPackageDateRanges(package_name, version) {
    const columns = ['project', 'date']
    if (version) {  columns.push('version') }
    const table = findOptimalTable(columns)
    const results = await query('getPackageDateRanges',`SELECT
            max(date) AS max_date,
            min(date) AS min_date
        FROM ${PYPI_DATABASE}.${table}
        WHERE project = {package_name:String} AND ${version ? `version={version:String}`: '1=1'}`, {
        package_name: package_name,
        version: version
    })
    return results[0]
}

export async function getPackageDetails(package_name, version) {
    return query('getPackageDetails',`WITH (
                SELECT version
                FROM ${PYPI_DATABASE}.projects
                WHERE name = {package_name:String}
                ORDER BY arrayMap(x -> toUInt8OrDefault(x, 0), splitByChar('.', version)) DESC
                LIMIT 1
            ) AS max_version
        SELECT
            name,
            version,
            summary,
            author,
            author_email,
            license,
            home_page,
            max_version
        FROM ${PYPI_DATABASE}.projects
        WHERE (name = {package_name:String}) AND ${version ? `version={version:String}`: '1=1'} 
        ORDER BY upload_time DESC
        LIMIT 1`, {
            package_name: package_name,
            version: version
        })
}

export async function getDownloadsOverTime(package_name, version, period, min_date, max_date, country_code) {
    const columns = ['project', 'date']
    if (version) {  columns.push('version') }
    if (country_code) { columns.push('country_code') }
    const table = findOptimalTable(columns)
    return query('getDownloadsOverTime',`SELECT
        toStartOf${period}(date)::Date32 AS x,
        sum(count) AS y
    FROM ${PYPI_DATABASE}.${table}
    WHERE (date >= {min_date:String}::Date32) AND (date < {max_date:String}::Date32) AND (project = {package_name:String}) AND ${version ? `version={version:String}`: '1=1'} AND ${country_code ? `country_code={country_code:String}`: '1=1'}
    GROUP BY x
    ORDER BY x ASC`, {
        package_name: package_name,
        version: version,
        min_date: min_date,
        max_date: max_date,
        country_code: country_code
    })
}

export async function getTopDistributionTypes(package_name, version, min_date, max_date) {
    return query('getTopDistributionTypes',`SELECT
            type AS name,
            sum(count) AS value
        FROM ${PYPI_DATABASE}.pypi_downloads_per_day_by_version_by_file_type
        WHERE (date >= {min_date:String}::Date32) AND (date < {max_date:String}::Date32) AND (project = {package_name:String}) AND ${version ? `version={version:String}`: '1=1'}
        GROUP BY type LIMIT 7`, {
            package_name: package_name,
            version: version,
            min_date: min_date,
            max_date: max_date
        })
}

export async function getTopVersions(package_name, version, min_date, max_date, country_code) {
    const columns = ['project', 'date', 'version']
    if (country_code) { columns.push('country_code') }
    const table = findOptimalTable(columns)
    return query('getTopVersions',`SELECT
            version AS name,
            sum(count) AS value
        FROM ${PYPI_DATABASE}.${table}
        WHERE (date >= {min_date:String}::Date32) AND (date < {max_date:String}::Date32) AND (project = {package_name:String}) 
            AND ${version ? `version={version:String}`: '1=1'} AND ${country_code ? `country_code={country_code:String}`: '1=1'}
        GROUP BY version ORDER BY value DESC LIMIT 6`, {
            package_name: package_name,
            version: version,
            min_date: min_date,
            max_date: max_date,
            country_code: country_code
        })
}

export async function getDownloadsOverTimeByPython(package_name, version, period, min_date, max_date, country_code) {
    const columns = ['project', 'date', 'python_minor']
    if (country_code) { columns.push('country_code') }
    if (version) { columns.push('version') }
    const table = findOptimalTable(columns)
    return query('getDownloadsOverTimeByPython',`SELECT
            python_minor as name,
            toStartOf${period}(date)::Date32 AS x,
            ${table == PYPI_TABLE ? 'count()': 'sum(count)'} AS y
        FROM ${PYPI_DATABASE}.${table}
        WHERE (date >= {min_date:String}::Date32) AND (date < {max_date:String}::Date32) AND (project = {package_name:String}) 
        AND ${version ? `version={version:String}`: '1=1'} AND python_minor != '' 
        AND ${country_code ? `country_code={country_code:String}`: '1=1'}
        GROUP BY name, x
        ORDER BY x ASC, y DESC LIMIT 4 BY x`, {
            package_name: package_name,
            min_date: min_date,
            max_date: max_date,
            version: version,
            country_code: country_code
        })
}

export async function getDownloadsOverTimeBySystem(package_name, version, period, min_date, max_date, country_code) {
    const columns = ['project', 'date', 'system']
    if (country_code) { columns.push('country_code') }
    if (version) { columns.push('version') }
    const table = findOptimalTable(columns)
    return query('getDownloadsOverTimeBySystem',`WITH systems AS
    (
        SELECT system
        FROM ${PYPI_DATABASE}.${table}
        WHERE (date >= {min_date:String}::Date32) AND (date < {max_date:String}::Date32) AND (project = {package_name:String}) AND ${version ? `version={version:String}`: '1=1'} AND system != ''
        GROUP BY system
        ORDER BY count() DESC
        LIMIT 4
    ) SELECT
        system as name,
        toStartOf${period}(date)::Date32 AS x,
        ${table == PYPI_TABLE ? 'count()': 'sum(count)'} AS y
        FROM ${PYPI_DATABASE}.${table}
        WHERE (date >= {min_date:String}::Date32) AND (date < {max_date:String}::Date32) AND (project = {package_name:String}) 
        AND ${version ? `version={version:String}`: '1=1'} AND system IN systems 
        AND ${country_code ? `country_code={country_code:String}`: '1=1'}
        GROUP BY name, x ORDER BY x ASC, y DESC LIMIT 4 BY x`, {
            min_date: min_date,
            max_date: max_date,
            package_name: package_name,
            version: version,
            country_code: country_code
        })
}

export async function getDownloadsByCountry(package_name, version, min_date, max_date, country_code) {
    const columns = ['project', 'date', 'country_code']
    if (version) { columns.push('version') }
    const table = findOptimalTable(columns)
    return query('getDownloadsByCountry',`SELECT name, code AS country_code, value 
                    FROM countries AS all 
                    LEFT OUTER JOIN (
                        SELECT country_code, 
                        sum(count) AS value 
                        FROM ${PYPI_DATABASE}.${table} 
                    WHERE (date >= {min_date:String}::Date32) AND 
                        (date < {max_date:String}::Date32) AND 
                        project = {package_name:String} AND 
                        ${version ? `version={version:String}`: '1=1'} GROUP BY country_code 
                    ) AS values ON all.code = values.country_code`, 
            {
            package_name: package_name,
            version: version,
            min_date: min_date,
            max_date: max_date,
            country_code: country_code
        })
}

export async function getFileTypesByInstaller(package_name, version, min_date, max_date, country_code) {
    const columns = ['project', 'date', 'installer', 'type']
    if (version) { columns.push('version') }
    if (country_code) { columns.push('country_code') }
    const table = findOptimalTable(columns)
    return query('getFileTypesByInstaller',`WITH installers AS
        (
            SELECT installer
            FROM ${PYPI_DATABASE}.${table}
            WHERE (date >= {min_date:String}::Date32) AND (date < {max_date:String}::Date32) AND installer != '' AND (project = {package_name:String}) 
                    AND ${version ? `version={version:String}`: '1=1'} AND ${country_code ? `country_code={country_code:String}`: '1=1'}
            GROUP BY installer
            ORDER BY count() DESC
            LIMIT 6
        )
        SELECT
            installer AS name,
            type AS y,
            sum(count) AS value
        FROM ${PYPI_DATABASE}.${table}
        WHERE (date >= {min_date:String}::Date32) AND (date < {max_date:String}::Date32) AND installer IN installers AND (project = {package_name:String}) 
                AND ${version ? `version={version:String}`: '1=1'} AND ${country_code ? `country_code={country_code:String}`: '1=1'}
        GROUP BY
            installer,
            type
        ORDER BY
            installer ASC,
            value DESC`, {
                min_date: min_date,
                max_date: max_date,
                package_name: package_name,
                version: version,
                country_code: country_code
        })
}

export async function getPercentileRank(min_date, max_date, country_code) {
    const columns = ['project', 'date']
    if (country_code) { columns.push('country_code') }
    const table = findOptimalTable(columns)
    const quantiles = [...Array(100).keys()].map(percentile => percentile/100) 
    return query('getPercentileRank',`WITH downloads AS
    (
        SELECT sum(count) AS c
        FROM ${PYPI_DATABASE}.${table}
        WHERE (date >= {min_date:String}::Date32) AND (date < {max_date:String}::Date32) AND ${country_code ? `country_code={country_code:String}`: '1=1'}
        GROUP BY project
    )
    SELECT quantiles(${quantiles.join(',')})(c) as quantiles
    FROM downloads
    LIMIT 10`, {
        min_date: min_date,
        max_date: max_date,
        country_code: country_code,
    })
}


export async function getRecentReleases(packages) {
    return query('getRecentReleases', `
        WITH (
            SELECT max(upload_time) AS max_date
            FROM ${PYPI_DATABASE}.projects
        ) AS max_date
        SELECT
            release_month as x,
            name as y,
            uniqExact(version) AS z
        FROM ${PYPI_DATABASE}.projects
        WHERE (name IN {packages:Array(String)}) AND (toStartOfMonth(upload_time) > toStartOfMonth(max_date - toIntervalMonth(6)))
        GROUP BY
            name,
            toMonth(upload_time) AS month,
            formatDateTime(upload_time, '%b') AS release_month
        ORDER BY month ASC
        LIMIT ${packages.length * 6}
        `, {
        packages: packages
    })
}

// top repos with no downloads prior to last 3 months
export async function getPopularEmergingRepos() {
    return query('getEmergingRepos',`
        WITH (
            SELECT max(max_date)
            FROM ${PYPI_DATABASE}.pypi_downloads_max_min
        ) AS max_date
        SELECT
            project as name,
            sum(count) AS c
        FROM ${PYPI_DATABASE}.pypi_downloads_per_day
        WHERE project IN (
            SELECT project
            FROM ${PYPI_DATABASE}.pypi_downloads_max_min
            WHERE min_date >= (max_date - toIntervalMonth(3))
            GROUP BY project
        )
        GROUP BY project
        ORDER BY c DESC
        LIMIT 5
    `)
}

// highest downloaded repos with no update in last 3 months
export async function getPopularReposNeedingARefresh() {
    return query('getPopularReposNeedingARefresh', `
        WITH (
            SELECT max(upload_time) AS max_date
            FROM ${PYPI_DATABASE}.projects
        ) AS max_date
        SELECT
            project AS name,
            sum(count) AS c,
            formatDateTime(dictGet('${PYPI_DATABASE}.last_updated_dict', 'last_update', project), '%d %M %Y') AS last_updated
        FROM ${PYPI_DATABASE}.pypi_downloads_per_day
        WHERE dictGet('${PYPI_DATABASE}.last_updated_dict', 'last_update', project) <= (max_date - toIntervalMonth(6))
        GROUP BY project
        ORDER BY c DESC
        LIMIT 5
    `)
}

async function query(query_name, query, query_params) {
    const start = performance.now()
    const results = await clickhouse.query({
        query: query,
        query_params: query_params,
        format: 'JSONEachRow',
    })
    const end = performance.now()
    console.log(`Execution time for ${query_name}: ${end - start} ms`)
    if (end - start > 1000) {
        if (query_params) {
            console.log(query, query_params)
        } else {
            console.log(query)
        }
    }
    return results.json()
}

