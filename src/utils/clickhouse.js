import { createClient } from '@clickhouse/client';
import { createClient as createWebClient } from '@clickhouse/client-web';
import { base64Encode } from './utils';


export const clickhouse = createClient({
    host: process.env.CLICKHOUSE_HOST,
    username: process.env.CLICKHOUSE_USERNAME,
    password: process.env.CLICKHOUSE_PASSWORD,
    clickhouse_settings: {
        allow_experimental_analyzer: 0,
    }
});

export const web_clickhouse = createWebClient({
    host: process.env.NEXT_PUBLIC_CLICKHOUSE_HOST,
    username: 'play'
});

const PYPI_DATABASE = process.env.PYPI_DATABASE || 'pypi';
const GITHUB_DATABASE = process.env.GITHUB_DATABASE || 'github'

const PYPI_TABLE = process.env.PYPI_TABLE || 'pypi';
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
    { columns: ['project', 'date', 'version', 'type'], table: 'pypi_downloads_per_day_by_version_by_file_type' },
    { columns: ['project', 'max_date', 'min_date'], table: 'pypi_downloads_max_min' },
];

export async function ping(name) {
    await web_clickhouse.query({
        query: 'SELECT {name:String}',
        query_params: {
            name: name
        },
    })
}

export async function runAPIEndpoint(endpoint, params) {
    const data = {
        queryVariables: params,
        format: 'JSONEachRow'
    };
    const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Basic ${btoa(`${process.env.API_KEY_ID}:${process.env.API_KEY_SECRET}`)}`
        },
        body: JSON.stringify(data)
    })
    return response.json()
}

export async function getGithubStatsEndpoint(package_name, min_date, max_date) {
    return runAPIEndpoint(process.env.GITHUB_STATS_API, {
        package_name: package_name,
        min_date: min_date,
        max_date: max_date
    })
}

// based on required columns we identify the most optimal mv to query - this is the smallest view (least columns) which covers all required columns 
function findOptimalTable(required_columns) {

    const candidates = materialized_views.filter(value => {
        if (value.columns.length >= required_columns.length) {
            // are all required columns in the candidate
            if (required_columns.every(column => value.columns.includes(column))) {
                return true
            }
        }
        return false
    })
    let table = PYPI_TABLE
    if (candidates.length > 0) {
        // best match is shortest
        table = candidates.reduce((a, b) => a.columns.length <= b.columns.length ? a : b).table
    }
    return table
}

function getQueryCustomSettings(query_name) {
    const queryCustomSettings = process.env.QUERY_CUSTOM_SETTINGS || '{}'
    const settings = JSON.parse(queryCustomSettings)
    return settings[query_name] || {}
}

export async function getPackages(query_prefix) {
    if (query_prefix != '') {
        return await query('getPackages', `SELECT project, sum(count) AS c FROM ${PYPI_DATABASE}.${findOptimalTable(['project'])} WHERE project LIKE {query_prefix:String} GROUP BY project ORDER BY c DESC LIMIT 6`, {
            query_prefix: `${query_prefix.toLowerCase().trim()}%`
        }
        )
    }
    return []
}

export async function getGithubStats(package_name, min_date, max_date) {
    return query('getGitubStats', `WITH
        getRepoId({package_name:String}) AS id,
        (
            SELECT uniqExact(actor_login) AS pr_creators
            FROM ${GITHUB_DATABASE}.github_events
            WHERE (event_type = 'PullRequestEvent') AND (action = 'opened') AND (repo_id = id) AND created_at > {min_date:Date32} AND created_at <= {max_date:Date32}
        ) AS pr_creators,
        (
            SELECT uniqExact(number) AS prs
            FROM ${GITHUB_DATABASE}.github_events
            WHERE (event_type = 'PullRequestEvent') AND (repo_id = id) AND created_at > {min_date:Date32} AND created_at <= {max_date:Date32}
        ) AS prs,
        (
            SELECT uniqExact(number) AS issues
            FROM ${GITHUB_DATABASE}.github_events
            WHERE (event_type = 'IssuesEvent') AND (repo_id = id) AND created_at > {min_date:Date32} AND created_at <= {max_date:Date32}
        ) AS issues,
        (
            SELECT uniqExact(actor_login) AS forks
            FROM ${GITHUB_DATABASE}.github_events
            WHERE (event_type = 'ForkEvent') AND (repo_id = id) AND created_at > {min_date:Date32} AND created_at <= {max_date:Date32}
        ) AS forks
    SELECT
        id,
        pr_creators,
        prs,
        issues,
        forks`,
        {
            min_date: min_date,
            max_date: max_date,
            package_name: package_name
        })
}

export async function getGithubStarsOverTime(package_name, min_date, max_date) {
    return query('getGithubStarsOverTime', `WITH
      getRepoId({package_name:String}) AS id,
      (
          SELECT groupArrayDistinct(actor_login) FROM ${GITHUB_DATABASE}.github_events WHERE repo_id = id AND (event_type = 'WatchEvent') AND (action = 'started') AND (created_at <= {min_date:Date32})
      ) AS initial
      SELECT
            x,
            arrayUniq(arrayConcat(initial,y)) AS y
        FROM
        (
            SELECT
                x,
                groupArrayDistinctArray(groupArrayDistinct(actor_login)) OVER (ORDER BY x ASC) AS y
            FROM ${GITHUB_DATABASE}.github_events
            WHERE repo_id = id AND (event_type = 'WatchEvent') AND (action = 'started') AND (created_at > {min_date:Date32}) AND (created_at <= {max_date:Date32})
            GROUP BY multiIf(date_diff('month', {min_date:Date32},{max_date:Date32}) <= 2,toStartOfDay(created_at)::Date32, date_diff('month', {min_date:Date32},{max_date:Date32}) <= 12, toStartOfWeek(created_at), date_diff('month', {min_date:Date32},{max_date:Date32}) <= 60, toStartOfMonth(created_at), toStartOfQuarter(created_at)) AS x
            ORDER BY x ASC
        )`, {
        package_name: package_name,
        min_date: min_date,
        max_date: max_date
    })
}

export async function getDependents({ package_name, version, min_date, max_date, country_code, type }) {
    const columns = ['project', 'date']
    if (version) { columns.push('version') }
    if (country_code) { columns.push('country_code') }
    if (type) { columns.push('type') }
    const table = findOptimalTable(columns)
    return query('dependents', `WITH
        downloads AS
        (
            SELECT
                project,
                sum(count) AS downloads,
                dictGet(pypi.project_to_repo_name_dict, 'repo_name', project) AS repo_name,
                dictGet(github.repo_name_to_id_dict, 'repo_id', cityHash64(repo_name))::String AS repo_id
            FROM ${PYPI_DATABASE}.${table}
            WHERE project IN (
                SELECT name
                FROM ${PYPI_DATABASE}.projects
                WHERE arrayExists(e -> (e LIKE {package_name:String} || '%'), requires_dist) != 0 AND name != {package_name:String}
                GROUP BY name
            ) AND ${country_code ? `country_code={country_code:String}` : '1=1'} AND ${type ? `type={type:String}` : '1=1'} AND (date >= {min_date:String}::Date32) AND (date < {max_date:String}::Date32)
            GROUP BY project
            ORDER BY downloads DESC
            LIMIT 9
        ),
        stars AS
        (
            SELECT
                repo_id,
                uniqExact(actor_login) AS stars
            FROM ${GITHUB_DATABASE}.github_events
            WHERE (event_type = 'WatchEvent') AND (action = 'started') AND (repo_id IN (
                SELECT repo_id
                FROM downloads WHERE repo_id != '0'
            )) AND (created_at >= {min_date:String}::Date32) AND (created_at < {max_date:String}::Date32)
            GROUP BY repo_id
        )
        SELECT
            downloads.project AS package,
            downloads.downloads AS downloads,
            stars.stars AS stars
        FROM downloads
        LEFT JOIN stars ON downloads.repo_id = stars.repo_id`, {
        package_name: package_name,
        version: version,
        min_date: min_date,
        max_date: max_date,
        country_code: country_code,
        type: type,
    })
}

export async function getDependencies({ package_name, version, min_date, max_date, country_code, type }) {
    const columns = ['project', 'date']
    if (version) { columns.push('version') }
    if (country_code) { columns.push('country_code') }
    if (type) { columns.push('type') }
    const table = findOptimalTable(columns)

    return query('dependencies', `WITH
        dependencies AS
        (
            SELECT extract(requires_dist, '^[a-zA-Z0-9\\-_]+') AS dependency
            FROM
            (
                SELECT arrayJoin(requires_dist) AS requires_dist
                FROM ${PYPI_DATABASE}.projects
                WHERE name = {package_name:String} AND ${version ? `version={version:String}` : '1=1'}
                GROUP BY requires_dist
                HAVING requires_dist NOT LIKE '%extra ==%'
            )
        ),
        downloads AS
        (
            SELECT project,
                sum(count) AS downloads,
                dictGet(pypi.project_to_repo_name_dict, 'repo_name', project) AS repo_name,
                dictGet(github.repo_name_to_id_dict, 'repo_id', cityHash64(repo_name)) AS repo_id
            FROM ${PYPI_DATABASE}.${table}
            WHERE project IN dependencies AND ${country_code ? `country_code={country_code:String}` : '1=1'} AND ${type ? `type={type:String}` : '1=1'} AND (date >= {min_date:String}::Date32) AND (date < {max_date:String}::Date32)
            GROUP BY project
            ORDER BY downloads DESC
            LIMIT 9
        ),
        stars AS
        (
            SELECT repo_id, uniqExact(actor_login) AS stars
            FROM ${GITHUB_DATABASE}.github_events
            WHERE (event_type = 'WatchEvent') AND (action = 'started') AND (repo_id IN (SELECT repo_id FROM downloads WHERE repo_id != 0)) AND (created_at >= {min_date:String}::Date32) AND (created_at < {max_date:String}::Date32)
            GROUP BY repo_id
        )
        SELECT downloads.project AS package,
            downloads.downloads AS downloads,
            stars.stars AS stars
            FROM downloads
            LEFT JOIN stars ON downloads.repo_id::String = stars.repo_id
        `, {
        package_name: package_name,
        version: version,
        min_date: min_date,
        max_date: max_date,
        country_code: country_code,
        type: type,
    })
}

export async function getTopContributors({ package_name, min_date, max_date }) {
    return query('getTopContributors', `WITH getRepoId({package_name:String}) AS id,
        (
        SELECT count() AS total
        FROM ${GITHUB_DATABASE}.github_events
        WHERE repo_id = id AND created_at > {min_date:Date32} AND created_at <= {max_date:Date32} AND actor_login NOT LIKE '%bot' AND actor_login NOT LIKE '%[bot]' AND actor_login NOT LIKE 'robot%'
        AND (
            (event_type = 'PullRequestEvent' AND action = 'opened') OR
            (event_type = 'IssuesEvent' AND action = 'opened') OR
            (event_type = 'IssueCommentEvent' AND action = 'created') OR
            (event_type = 'PullRequestReviewEvent' AND action = 'created') OR
            (event_type = 'PullRequestReviewCommentEvent' AND action = 'created') OR
            (event_type = 'PushEvent')
        )
        ) as total
        SELECT actor_login AS x, count() AS y, round(y/total * 100, 4) as percent, 'contributors' as name, 'https://github.com/' || actor_login || '.png?size=80' as icon
        FROM ${GITHUB_DATABASE}.github_events
        WHERE repo_id = id AND created_at > {min_date:Date32} AND created_at <= {max_date:Date32} AND actor_login NOT LIKE '%bot' AND actor_login NOT LIKE '%[bot]' AND actor_login NOT LIKE 'robot%'
        AND (
            (event_type = 'PullRequestEvent' AND action = 'opened') OR
            (event_type = 'IssuesEvent' AND action = 'opened') OR
            (event_type = 'IssueCommentEvent' AND action = 'created') OR
            (event_type = 'PullRequestReviewEvent' AND action = 'created') OR
            (event_type = 'PullRequestReviewCommentEvent' AND action = 'created') OR
            (event_type = 'PushEvent')
        )
        GROUP BY actor_login ORDER BY y DESC LIMIT 10`, {
        package_name: package_name,
        min_date: min_date,
        max_date: max_date
    })
}

export async function getTotalDownloads() {
    return query('getTotalDownloads', `SELECT
        formatReadableQuantity(sum(count)) AS total, uniqExact(project) as projects FROM ${PYPI_DATABASE}.${findOptimalTable(['project'])}`)
}

export async function getDownloadSummary(package_name, version, min_date, max_date, country_code, type) {
    const columns = ['project', 'date']
    if (version) { columns.push('version') }
    if (country_code) { columns.push('country_code') }
    if (type) { columns.push('type') }
    const table = findOptimalTable(columns)
    return query('getDownloadSummary', `SELECT sumIf(count, date > {min_date:String}::Date32 AND date > {max_date:String}::Date32 - toIntervalDay(1) AND date <= {max_date:String}::Date32) AS last_day,
    sumIf(count, date > {min_date:String}::Date32 AND date > {max_date:String}::Date32 - toIntervalWeek(1) AND date <= {max_date:String}::Date32) AS last_week,
    sumIf(count, date > {min_date:String}::Date32 AND date > {max_date:String}::Date32 - toIntervalMonth(1) AND date <= {max_date:String}::Date32) AS last_month,
    sumIf(count, date > {min_date:String}::Date32 AND date > {min_date:String}::Date32 AND date <= {max_date:String}::Date32) AS total
    FROM ${PYPI_DATABASE}.${table} WHERE (project = {package_name:String}) AND ${version ? `version={version:String}` : '1=1'} AND ${country_code ? `country_code={country_code:String}` : '1=1'} 
    AND ${type ? `type={type:String}` : '1=1'}`,
        {
            min_date: min_date,
            max_date: max_date,
            package_name: package_name,
            version: version,
            country_code: country_code,
            type: type,
        })
}

export async function getProjectCount() {
    return query('getProjectCount', `SELECT
        project,
        sum(count) AS c
    FROM ${PYPI_DATABASE}.${findOptimalTable(['project'])}
    GROUP BY project
    ORDER BY c DESC
    LIMIT 5`)
}

export async function getRecentPackageDownloads(package_name) {

    return query('getRecentPackageDownloads', `WITH (
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
    if (version) { columns.push('version') }
    const table = findOptimalTable(columns)
    const [_, results] = await query('getPackageDateRanges', `SELECT
            max(date) AS max_date,
            min(date) AS min_date
        FROM ${PYPI_DATABASE}.${table}
        WHERE project = {package_name:String} AND ${version ? `version={version:String}` : '1=1'}`, {
        package_name: package_name,
        version: version
    })
    return results[0]
}

export async function getPackageDetails(package_name, version) {
    return query('getPackageDetails', `WITH (
                SELECT version
                FROM ${PYPI_DATABASE}.projects
                WHERE name = {package_name:String}
                ORDER BY arrayMap(x -> toUInt8OrDefault(x, 0), splitByChar('.', version)) DESC
                LIMIT 1
            ) AS max_version
        SELECT
            version,
            summary,
            author,
            author_email,
            license,
            home_page,
            max_version,
            getRepoName({package_name:String}) as repo_name
        FROM ${PYPI_DATABASE}.projects
        WHERE (name = {package_name:String}) AND ${version ? `version={version:String}` : '1=1'} 
        ORDER BY upload_time DESC
        LIMIT 1`, {
        package_name: package_name,
        version: version
    })
}

export async function getDownloadsOverTime({ package_name, version, min_date, max_date, country_code, type }) {
    const columns = ['project', 'date']
    if (version) { columns.push('version') }
    if (country_code) { columns.push('country_code') }
    if (type) { columns.push('type') }
    const table = findOptimalTable(columns)
    return query('getDownloadsOverTime', `SELECT
        if(date_diff('month', {min_date:Date32},{max_date:Date32}) <= 6,toStartOfDay(date)::Date32, toStartOfWeek(date)::Date32) AS x,
        sum(count) AS y
    FROM ${PYPI_DATABASE}.${table} 
    WHERE (date >= {min_date:Date32}) AND (date < if(date_diff('month', {min_date:Date32},{max_date:Date32}) <= 6,toStartOfDay({max_date:Date32})::Date32, toStartOfWeek({max_date:Date32})::Date32)) AND (project = {package_name:String}) 
    AND ${version ? `version={version:String}` : '1=1'} AND ${country_code ? `country_code={country_code:String}` : '1=1'} AND ${type ? `type={type:String}` : '1=1'}
    GROUP BY x
    ORDER BY x ASC`, {
        package_name: package_name,
        version: version,
        min_date: min_date,
        max_date: max_date,
        country_code: country_code,
        type: type,
    })
}

export async function getTopDistributionTypes(package_name, version, min_date, max_date) {
    return query('getTopDistributionTypes', `SELECT
            type AS name,
            sum(count) AS value
        FROM ${PYPI_DATABASE}.pypi_downloads_per_day_by_version_by_file_type
        WHERE (date >= {min_date:String}::Date32) AND (date < {max_date:String}::Date32) AND (project = {package_name:String}) AND ${version ? `version={version:String}` : '1=1'} 
        GROUP BY type LIMIT 7`, {
        package_name: package_name,
        version: version,
        min_date: min_date,
        max_date: max_date
    })
}

export async function getTopVersions({ package_name, version, min_date, max_date, country_code, type }) {
    const columns = ['project', 'date', 'version']
    if (country_code) { columns.push('country_code') }
    if (type) { columns.push('type') }
    const table = findOptimalTable(columns)
    return query('getTopVersions', `SELECT
            version AS name,
            sum(count) AS value
        FROM ${PYPI_DATABASE}.${table}
        WHERE (date >= {min_date:String}::Date32) AND (date < {max_date:String}::Date32) AND (project = {package_name:String}) 
            AND ${version ? `version={version:String}` : '1=1'} AND ${country_code ? `country_code={country_code:String}` : '1=1'} AND ${type ? `type={type:String}` : '1=1'}
        GROUP BY version ORDER BY value DESC LIMIT 6`, {
        package_name: package_name,
        version: version,
        min_date: min_date,
        max_date: max_date,
        country_code: country_code,
        type: type,
    })
}

export async function getDownloadsOverTimeByPython({ package_name, version, min_date, max_date, country_code, type }) {
    const columns = ['project', 'date', 'python_minor']
    if (country_code) { columns.push('country_code') }
    if (version) { columns.push('version') }
    if (type) { columns.push('type') }
    const table = findOptimalTable(columns)
    return query('getDownloadsOverTimeByPython', `SELECT
        if (python_minor IN
            (SELECT python_minor FROM ${PYPI_DATABASE}.${table}
                                WHERE (date >= {min_date:Date32}) AND (date < if(date_diff('month', {min_date:Date32},{max_date:Date32}) <= 6,toStartOfDay({max_date:Date32})::Date32, toStartOfWeek({max_date:Date32})::Date32)) AND (project = {package_name:String}) 
                                AND ${version ? `version={version:String}`: '1=1'} AND python_minor != '' 
                                AND ${country_code ? `country_code={country_code:String}`: '1=1'} AND ${type ? `type={type:String}`: '1=1'}
                                GROUP BY python_minor
                                ORDER BY count() DESC LIMIT 10
            ), python_minor, 'other') as name,
        if(date_diff('month', {min_date:Date32},{max_date:Date32}) <= 6,toStartOfDay(date)::Date32, toStartOfWeek(date)::Date32) AS x,
        sum(count) AS y
        FROM ${PYPI_DATABASE}.${table}
        WHERE (date >= {min_date:Date32}) AND (date < if(date_diff('month', {min_date:Date32},{max_date:Date32}) <= 6,toStartOfDay({max_date:Date32})::Date32, toStartOfWeek({max_date:Date32})::Date32)) AND (project = {package_name:String}) 
        AND ${version ? `version={version:String}`: '1=1'} AND python_minor != '' 
        AND ${country_code ? `country_code={country_code:String}`: '1=1'} AND ${type ? `type={type:String}`: '1=1'}
        GROUP BY name, x
        ORDER BY x ASC, y DESC`, {
        package_name: package_name,
        min_date: min_date,
        max_date: max_date,
        version: version,
        country_code: country_code,
        type: type
    })
}



export async function getDownloadsOverTimeBySystem({ package_name, version, min_date, max_date, country_code, type }) {
    const columns = ['project', 'date', 'system']
    if (country_code) { columns.push('country_code') }
    if (version) { columns.push('version') }
    if (type) { columns.push('type') }
    const table = findOptimalTable(columns)
    return query('getDownloadsOverTimeBySystem', `WITH systems AS
    (
        SELECT system
        FROM ${PYPI_DATABASE}.${table}
        WHERE (date >= {min_date:String}::Date32) AND (date < {max_date:String}::Date32) AND (project = {package_name:String}) AND ${version ? `version={version:String}` : '1=1'} AND system != ''
        GROUP BY system
        ORDER BY count() DESC
        LIMIT 4
    ) SELECT
        system as name,
        if(date_diff('month', {min_date:Date32},{max_date:Date32}) <= 6,toStartOfDay(date)::Date32, toStartOfWeek(date)::Date32) AS x,
        ${table == PYPI_TABLE ? 'count()' : 'sum(count)'} AS y
        FROM ${PYPI_DATABASE}.${table}
        WHERE (date >= {min_date:String}::Date32) AND (date < if(date_diff('month', {min_date:Date32},{max_date:Date32}) <= 6,toStartOfDay({max_date:Date32})::Date32, toStartOfWeek({max_date:Date32})::Date32)) AND (project = {package_name:String}) 
        AND ${version ? `version={version:String}` : '1=1'} AND system IN systems 
        AND ${country_code ? `country_code={country_code:String}` : '1=1'} AND ${type ? `type={type:String}` : '1=1'}
        GROUP BY name, x ORDER BY x ASC, y DESC LIMIT 4 BY x`, {
        min_date: min_date,
        max_date: max_date,
        package_name: package_name,
        version: version,
        country_code: country_code,
        type: type
    })
}

export async function getDownloadsByCountry({ package_name, version, min_date, max_date, country_code, type }) {
    const columns = ['project', 'date', 'country_code']
    if (version) { columns.push('version') }
    if (type) { columns.push('type') }
    const table = findOptimalTable(columns)
    return query('getDownloadsByCountry', `SELECT name, code AS country_code, value 
                    FROM pypi.countries AS all 
                    LEFT OUTER JOIN (
                        SELECT country_code, 
                        sum(count) AS value 
                        FROM ${PYPI_DATABASE}.${table} 
                    WHERE (date >= {min_date:String}::Date32) AND 
                        (date < {max_date:String}::Date32) AND 
                        project = {package_name:String} AND 
                        ${version ? `version={version:String}` : '1=1'} AND 
                        ${type ? `type={type:String}` : '1=1'} GROUP BY country_code 
                    ) AS values ON all.code = values.country_code`,
        {
            package_name: package_name,
            version: version,
            min_date: min_date,
            max_date: max_date,
            country_code: country_code,
            type: type
        })
}

export async function getFileTypesByInstaller({ package_name, version, min_date, max_date, country_code, type }) {
    const columns = ['project', 'date', 'installer', 'type']
    if (version) { columns.push('version') }
    if (country_code) { columns.push('country_code') }
    const table = findOptimalTable(columns)
    return query('getFileTypesByInstaller', `WITH installers AS
        (
            SELECT installer
            FROM ${PYPI_DATABASE}.${table}
            WHERE (date >= {min_date:String}::Date32) AND (date < {max_date:String}::Date32) AND installer != '' AND (project = {package_name:String}) 
                    AND ${version ? `version={version:String}` : '1=1'} AND ${country_code ? `country_code={country_code:String}` : '1=1'} AND ${type ? `type={type:String}` : '1=1'}
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
                AND ${version ? `version={version:String}` : '1=1'} AND ${country_code ? `country_code={country_code:String}` : '1=1'} AND ${type ? `type={type:String}` : '1=1'}
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
        country_code: country_code,
        type: type
    })
}

export async function getPercentileRank(min_date, max_date, country_code) {
    const columns = ['project', 'date']
    if (country_code) { columns.push('country_code') }
    const table = findOptimalTable(columns)
    const quantiles = [...Array(100).keys()].map(percentile => percentile / 100)
    return query('getPercentileRank', `WITH downloads AS
    (
        SELECT sum(count) AS c
        FROM ${PYPI_DATABASE}.${table}
        WHERE (date >= {min_date:String}::Date32) AND (date < {max_date:String}::Date32) AND ${country_code ? `country_code={country_code:String}` : '1=1'}
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
    return query('getEmergingRepos', `
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
            GROUP BY project
            HAVING min(min_date) >= (max_date - toIntervalMonth(3))
        )
        GROUP BY project
        ORDER BY c DESC
        LIMIT 7
        SETTINGS allow_experimental_analyzer=0
    `)
}

// highest downloaded repos with no update in last 3 months
export async function getPopularReposNeedingRefresh() {
    return query('getPopularReposNeedingRefresh', `
        WITH (
            SELECT max(upload_time) AS max_date
            FROM ${PYPI_DATABASE}.projects
        ) AS max_date
        SELECT
            project AS name,
            sum(count) AS c,
            formatDateTime(dictGet('${PYPI_DATABASE}.last_updated_dict', 'last_update', project), '%d %M %Y') AS last_updated
        FROM ${PYPI_DATABASE}.pypi_downloads_per_day
        WHERE dictGet('${PYPI_DATABASE}.last_updated_dict', 'last_update', project) BETWEEN '1970-01-02' AND (max_date - toIntervalMonth(6))
        GROUP BY project
        ORDER BY c DESC
        LIMIT 7
    `)
}


// biggest change in download in the last 6 months
export async function hotPackages() {
    const min_downloads = 100000
    return query('hotPackages', `
    WITH
    (
        SELECT max(max_date)
        FROM ${PYPI_DATABASE}.pypi_downloads_max_min
    ) AS max_date,
    percentage_increases AS
    (
        SELECT
            project,
            sum(count) AS c,
            month,
            any(c) OVER (PARTITION BY project ORDER BY month ASC ROWS BETWEEN 1 PRECEDING AND 1 PRECEDING) AS previous,
            if(previous > 0, (c - previous) / previous, 0) AS percent_increase
        FROM ${PYPI_DATABASE}.pypi_downloads_per_month
        WHERE ((month > (toStartOfMonth(max_date) - toIntervalMonth(6))) AND (month <= (toStartOfMonth(max_date)))) AND (project IN (
            SELECT project
            FROM pypi.pypi_downloads_per_month
            GROUP BY project
            HAVING sum(count) > ${min_downloads}
        ))
        GROUP BY
            project,
            month
        ORDER BY
            project ASC,
            month ASC
    )
    SELECT
        formatDateTime(month, '%b') as x,
        project as y,
        c AS z
    FROM percentage_increases
    WHERE project IN (
        SELECT project
        FROM percentage_increases
        GROUP BY project
        ORDER BY max(percent_increase) DESC
        LIMIT 5
    ) ORDER BY month DESC, project`)
}

export async function getPackageRanking(package_name, min_date, max_date, country_code) {

    const columns = ['project', 'date']
    if (country_code) { columns.push('country_code') }
    const table = findOptimalTable(columns)
    
    return query('getPackageRanking',`WITH
    (   SELECT
        sum(count) AS total
        FROM ${PYPI_DATABASE}.${table} WHERE project = {package_name:String} AND 1=1 AND date > {min_date:String}::Date32 AND date <= {max_date:String}::Date32 AND ${country_code ? `country_code={country_code:String}`: '1=1'} 
    ) AS downloads,
    (SELECT count() FROM ( SELECT project FROM ${PYPI_DATABASE}.${table} WHERE date > {min_date:String}::Date32 AND date <= {max_date:String}::Date32 AND ${country_code ? `country_code={country_code:String}`: '1=1'} GROUP BY project HAVING sum(count) >= downloads )) as rank,
    (SELECT uniqExact(project) FROM ${PYPI_DATABASE}.${table} WHERE date > {min_date:String}::Date32 AND date <= {max_date:String}::Date32 AND ${country_code ? `country_code={country_code:String}`: '1=1'}) as total_packages
        SELECT rank, total_packages, CASE
        WHEN total_packages = 0 THEN NULL
        ELSE (rank / total_packages) * 100
    END AS percentile;`, {
            package_name: package_name,
            min_date: min_date,
            max_date: max_date,
            country_code: country_code,
        })
}


export const revalidate = 3600;

async function query(query_name, query, query_params) {
    //const start = performance.now()
    const results = await clickhouse.query({
        query: query,
        query_params: query_params,
        format: 'JSONEachRow',
        clickhouse_settings: getQueryCustomSettings(query_name)
    })
    const end = performance.now()
    //console.log(`Execution time for ${query_name}: ${end - start} ms`)
    // if (end - start > 0) {
    //     if (query_params) {
    //         console.log(query, query_params)
    //     } else {
    //         console.log(query)
    //     }
    // }
    let query_link = `${process.env.NEXT_PUBLIC_QUERY_LINK_HOST || process.env.CLICKHOUSE_HOST}?query=${base64Encode(query)}`
    if (query_params != undefined) {
        const prefixedParams = Object.fromEntries(
            Object.entries(query_params)
                .filter(([, value]) => value !== undefined)
                .map(([key, value]) => [`param_${key}`, Array.isArray(value) ? `['${value.join("','")}']` : value])
        );
        query_link = `${query_link}&tab=results&${Object.entries(prefixedParams).map(([name, value]) => `${encodeURIComponent(name)}=${encodeURIComponent(value)}`).join('&')}`
    }
    return Promise.all([Promise.resolve(query_link), results.json()]);
}
