// Dates shown by the dashboard are inclusive UTC calendar dates.
export function defaultDownloadRange(latestDate) {
    const end = new Date(`${latestDate}T00:00:00Z`);
    if (Number.isNaN(end.getTime())) {
        throw new RangeError(`Invalid download date: ${latestDate}`);
    }
    const start = new Date(end);
    start.setUTCDate(start.getUTCDate() - 29);
    return { min_date: start.toISOString().slice(0, 10), max_date: latestDate };
}

export function groupOtherVersions(versions, limit = 6) {
    if (versions.length <= limit) return versions;
    const top = versions.slice(0, limit);
    const remainder = versions.slice(limit).reduce((sum, row) => sum + Number(row.value), 0);
    return [...top, { name: 'Other versions', value: remainder, isOther: true }];
}
