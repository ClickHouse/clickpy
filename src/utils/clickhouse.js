import { createClient } from '@clickhouse/client'

export const clickhouse = createClient({
    host: process.env.CLICKHOUSE_HOST,
    username: process.env.CLICKHOUSE_USERNAME,
    password: process.env.CLICKHOUSE_PASSWORD,
})


const filters_to_tables = [
    { columns: ['project'], table: 'pypi_downloads' },
    { columns: ['project', 'version'], table: 'pypi_downloads_by_version' },
    { columns: ['project', 'date'], table: 'pypi_downloads_per_day' },
    { columns: ['project', 'date', 'version'], table: 'pypi_downloads_per_day_by_version' },
    { columns: ['project', 'date', 'country_code'], table: 'pypi_downloads_per_day_by_country' },
    { columns: ['project', 'date', 'version', 'country_code'], table: 'pypi_downloads_per_day_by_country' },
    { columns: ['project', 'date', 'version', 'type'], table: 'pypi_downloads_per_day_by_file_type' },
    { columns: ['project', 'date', 'version', 'python'], table: 'pypi_downloads_per_day_by_python_version' },
    { columns: ['project', 'date', 'version', 'system'], table: 'pypi_downloads_per_day_by_system' },
    { columns: ['project', 'date', 'version', 'installer', 'type'], table: 'pypi_file_types_by_installer' },
]

// based on required columns we identify the most optimal mv to query
function findOptimalTable(required_columns) {
    const match = filters_to_tables.find(value => {
        if (value.columns.length == required_columns.length) {
            let difference = value.columns.filter(column => !required_columns.includes(column))
            if (difference.length == 0){
                return true
            }
        }
        return false
    })
    if (match) {
        return match.table
    }
    return 'pypi'
}


export async function getPackages(query_prefix) {
    if (query_prefix != '') { 
        const res = await query(`SELECT project, sum(count) AS c FROM ${findOptimalTable(['project'])} WHERE project LIKE {query_prefix:String} GROUP BY project ORDER BY c DESC LIMIT 6`, {
                query_prefix: `${query_prefix.toLowerCase().trim()}%`
            }
        )
        return res
    }
    return []
}

export async function getTotalDownloads() {
    const results = await query(`SELECT
        formatReadableQuantity(sum(count)) AS total, uniqExact(project) as projects FROM ${findOptimalTable(['project'])}`)
    return results[0]
}

export async function getDownloadSummary(package_name, version, min_date, max_date, country_code) {
    const columns = ['project', 'date']
    if (version) {  columns.push('version') }
    if (country_code) { columns.push('country_code') }
    const table = findOptimalTable(columns)
    console.log(`SELECT sumIf(count, date >= '${min_date}'::Date32 AND date >= '${max_date}'::Date32 - toIntervalDay(1) AND date <= '${max_date}'::Date32) AS last_day,
    sumIf(count, date >= '${min_date}'::Date32 AND date >= '${max_date}'::Date32 - toIntervalWeek(1) AND date <= '${max_date}'::Date32) AS last_week,
    sumIf(count, date >= '${min_date}'::Date32 AND date >= '${max_date}'::Date32 - toIntervalMonth(1) AND date <= '${max_date}'::Date32) AS last_month,
    sumIf(count, date >= '${min_date}'::Date32 AND date >= '${min_date}'::Date32 AND date <= '${max_date}'::Date32) AS total
    FROM ${table}
    WHERE (project = '${package_name}') AND country_code='${country_code}'`)

    return query(`SELECT sumIf(count, date >= {min_date:String}::Date32 AND date >= {max_date:String}::Date32 - toIntervalDay(1) AND date <= {max_date:String}::Date32) AS last_day,
    sumIf(count, date >= {min_date:String}::Date32 AND date >= {max_date:String}::Date32 - toIntervalWeek(1) AND date <= {max_date:String}::Date32) AS last_week,
    sumIf(count, date >= {min_date:String}::Date32 AND date >= {max_date:String}::Date32 - toIntervalMonth(1) AND date <= {max_date:String}::Date32) AS last_month,
    sumIf(count, date >= {min_date:String}::Date32 AND date >= {min_date:String}::Date32 AND date <= {max_date:String}::Date32) AS total
    FROM ${table}
    WHERE (project = {package_name:String}) AND ${version ? `version={version:String}`: '1=1'} AND ${country_code ? `country_code={country_code:String}`: '1=1'}`,
    {
        min_date: min_date,
        max_date: max_date,
        package_name: package_name,
        version: version,
        country_code: country_code,
    })
}

export async function getProjectCount() {
    return query(`SELECT
        project,
        round(sum(count) / 1000000) AS c
    FROM ${findOptimalTable(['project'])}
    GROUP BY project
    ORDER BY c DESC
    LIMIT 6`)
}

export async function getRecentPackageDownloads(package_name, max_date) {
    return query(`WITH (
        SELECT max(date) AS max_date
        FROM ${findOptimalTable(['project', 'date'])}
        WHERE project = {package_name:String}
    ) AS max_date
    SELECT
        toStartOfWeek(date) AS x,
        sum(count) AS y
    FROM ${findOptimalTable(['project', 'date'])}
    WHERE (project = {package_name:String}) AND (date > (max_date - toIntervalWeek(12)))
    GROUP BY x
    ORDER BY x ASC`, {
        package_name: package_name,
        max_date: max_date
    })
}

export async function getPackageDateRanges(package_name, version) {
    const columns = ['project', 'date']
    if (version) {  columns.push('version') }
    const table = findOptimalTable(columns)
    const results = await query(`SELECT
            max(date) AS max_date,
            min(date) AS min_date
        FROM ${table}
        WHERE project = {package_name:String} AND ${version ? `version={version:String}`: '1=1'}`, {
        package_name: package_name,
        version: version
    })
    return results[0]
}

export async function getPackageDetails(package_name, version) {
    return query(`WITH (
                SELECT version
                FROM packages
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
        FROM packages
        WHERE (name = {package_name:String}) AND ${version ? `version={version:String}`: '1=1'} 
        ORDER BY upload_time DESC
        LIMIT 1`, {
            package_name: package_name,
            version: version
        })
}

export async function getDownloadsOverTime(package_name, version, period, min_date, max_date) {
    return query(`SELECT
        toStartOf${period}(date)::Date32 AS x,
        sum(count) AS y
    FROM pypi_downloads_per_day_by_version
    WHERE (date >= {min_date:String}::Date32) AND (date < {max_date:String}::Date32) AND (project = {package_name:String}) AND ${version ? `version={version:String}`: '1=1'}
    GROUP BY x
    ORDER BY x ASC`, {
        package_name: package_name,
        version: version,
        min_date: min_date,
        max_date: max_date
    })
}

export async function getTopDistributionTypes(package_name, version, min_date, max_date) {
    return query(`SELECT
            type AS name,
            sum(count) AS value
        FROM pypi_downloads_per_day_by_file_type
        WHERE (date >= {min_date:String}::Date32) AND (date < {max_date:String}::Date32) AND (project = {package_name:String}) AND ${version ? `version={version:String}`: '1=1'}
        GROUP BY type LIMIT 7`, {
            package_name: package_name,
            version: version,
            min_date: min_date,
            max_date: max_date
        })
}

export async function getTopVersions(package_name, version, min_date, max_date) {
    return query(`SELECT
            version AS name,
            sum(count) AS value
        FROM pypi_downloads_per_day_by_version
        WHERE (date >= {min_date:String}::Date32) AND (date < {max_date:String}::Date32) AND (project = {package_name:String}) AND ${version ? `version={version:String}`: '1=1'}
        GROUP BY version ORDER BY value DESC LIMIT 6`, {
            package_name: package_name,
            version: version,
            min_date: min_date,
            max_date: max_date
        })
}

export async function getDownloadsOverTimeByPython(package_name, version, period, min_date, max_date) {
    return query(`SELECT
            python as name,
            toStartOf${period}(date)::Date32 AS x,
            sum(count) AS y
        FROM pypi_downloads_per_day_by_python_version
        WHERE (date >= {min_date:String}::Date32) AND (date < {max_date:String}::Date32) AND (project = {package_name:String}) AND ${version ? `version={version:String}`: '1=1'} AND python != ''
        GROUP BY name, x
        ORDER BY x ASC, y DESC LIMIT 4 BY x`, {
            package_name: package_name,
            min_date: min_date,
            max_date: max_date,
            version: version
        })
}

export async function getDownloadsOverTimeBySystem(package_name, version, period, min_date, max_date) {
    return query(`WITH systems AS
            (
                SELECT system
                FROM pypi_downloads_per_day_by_system
                WHERE (date >= {min_date:String}::Date32) AND (date < {max_date:String}::Date32) AND (project = {package_name:String}) AND ${version ? `version={version:String}`: '1=1'} AND system != ''
                GROUP BY system
                ORDER BY count() DESC
                LIMIT 4
            ) SELECT
            system as name,
            toStartOf${period}(date)::Date32 AS x,
            sum(count) AS y
        FROM pypi_downloads_per_day_by_system
        WHERE (date >= {min_date:String}::Date32) AND (date < {max_date:String}::Date32) AND (project = {package_name:String}) AND ${version ? `version={version:String}`: '1=1'} AND system IN systems
        GROUP BY name, x ORDER BY x ASC, y DESC LIMIT 4 BY x`, {
            min_date: min_date,
            max_date: max_date,
            package_name: package_name,
            version: version
        })
}

export async function getDownloadsByCountry(package_name, version, min_date, max_date) {
    return query(`SELECT
            dictGet('countries_dict', 'name', country_code) AS name,
            country_code,
            sum(count) AS value
        FROM pypi_downloads_per_day_by_country
        WHERE (date >= {min_date:String}::Date32) AND (date < {max_date:String}::Date32) AND (project = {package_name:String}) AND ${version ? `version={version:String}`: '1=1'}
        GROUP BY country_code`, {
            package_name: package_name,
            version: version,
            min_date: min_date,
            max_date: max_date
        })
}

export async function getFileTypesByInstaller(package_name, version, min_date, max_date) {
    return query(`WITH installers AS
        (
            SELECT installer
            FROM pypi_file_types_by_installer
            WHERE (date >= {min_date:String}::Date32) AND (date < {max_date:String}::Date32) AND installer != '' AND (project = {package_name:String}) AND ${version ? `version={version:String}`: '1=1'}
            GROUP BY installer
            ORDER BY count() DESC
            LIMIT 6
        )
        SELECT
            installer AS name,
            type AS y,
            sum(count) AS value
        FROM pypi_file_types_by_installer
        WHERE (date >= {min_date:String}::Date32) AND (date < {max_date:String}::Date32) AND installer IN installers AND (project = {package_name:String}) AND ${version ? `version={version:String}`: '1=1'}
        GROUP BY
            installer,
            type
        ORDER BY
            installer ASC,
            value DESC`, {
                min_date: min_date,
                max_date: max_date,
                package_name: package_name,
                version: version
        })
}

export async function getPercentileRank(min_date, max_date) {
    const quantiles = [...Array(100).keys()].map(percentile => percentile/100) 
    return query(`WITH downloads AS
    (
        SELECT sum(count) AS c
        FROM pypi_downloads_per_day
        WHERE (date >= {min_date:String}::Date32) AND (date < {max_date:String}::Date32)
        GROUP BY project
    )
    SELECT quantiles(${quantiles.join(',')})(c) as quantiles
    FROM downloads
    LIMIT 10`, {
        min_date: min_date,
        max_date: max_date
    })
}

async function query(query, query_params) {
    const results = await clickhouse.query({
        query: query,
        query_params: query_params,
        format: 'JSONEachRow',
    })
    return results.json()
}
