#!/bin/bash

mkdir -p gharchive

CLICKHOUSE_USER=default
CLICKHOUSE_HOST=${CLICKHOUSE_HOST:-localhost}
CLICKHOUSE_PASSWORD=${CLICKHOUSE_PASSWORD:-}

if [ -z "$1" ]; then
  echo "checking for latest date..."
  min_date=$(clickhouse-client --host ${CLICKHOUSE_HOST} --secure --password ${CLICKHOUSE_PASSWORD} --user ${CLICKHOUSE_USER} --query "SELECT max(file_time) FROM github.github_events");
  if [ "$min_date" == "1970-01-01 00:00:00" ]; then min_date=$(date -d '24 hour ago' '+%Y-%m-%d %H:00:00'); fi
else
  min_date=$1;
fi

if [ -z "$2" ]; then max_date=$(date '+%Y-%m-%d %H:00:00'); else max_date=$2; fi

echo "min date: ${min_date}"
echo "max date: ${max_date}"

echo "downloading files..."

clickhouse-local --query "WITH (SELECT (parseDateTimeBestEffort('${max_date}') - (parseDateTimeBestEffort('${min_date}') + INTERVAL 1 HOUR))/3600) as hours SELECT toString(toDate( (parseDateTimeBestEffort('${min_date}') + INTERVAL 1 HOUR) + INTERVAL arrayJoin(range(0, ifNull(toUInt64(hours) + 1, 0))) HOUR as t)) || '-' || toString(toHour(t)) || '.json.gz'" | xargs -I{} bash -c "[ -f ../gharchive/{} ] || wget --continue 'https://data.gharchive.org/{}'"

echo "inserting files..."

find . -maxdepth 1 -name '*.json.gz' | xargs -P$(nproc) -I{} bash -c "
gzip -cd {} | jq -c '
[
    (\"{}\" | scan(\"[0-9]+-[0-9]+-[0-9]+-[0-9]+\")),
    .type,
    .actor.login? // .actor_attributes.login? // (.actor | strings) // null,
    .repo.name? // (.repository.owner? + \"/\" + .repository.name?) // null,
    .repo.id,
    .created_at,
    .payload.updated_at? // .payload.comment?.updated_at? // .payload.issue?.updated_at? // .payload.pull_request?.updated_at? // null,
    .payload.action,
    .payload.comment.id,
    .payload.review.body // .payload.comment.body // .payload.issue.body? // .payload.pull_request.body? // .payload.release.body? // null,
    .payload.comment?.path? // null,
    .payload.comment?.position? // null,
    .payload.comment?.line? // null,
    .payload.ref? // null,
    .payload.ref_type? // null,
    .payload.comment.user?.login? // .payload.issue.user?.login? // .payload.pull_request.user?.login? // null,
    .payload.issue.number? // .payload.pull_request.number? // .payload.number? // null,
    .payload.issue.title? // .payload.pull_request.title? // null,
    [.payload.issue.labels?[]?.name // .payload.pull_request.labels?[]?.name],
    .payload.issue.state? // .payload.pull_request.state? // null,
    .payload.issue.locked? // .payload.pull_request.locked? // null,
    .payload.issue.assignee?.login? // .payload.pull_request.assignee?.login? // null,
    [.payload.issue.assignees?[]?.login? // .payload.pull_request.assignees?[]?.login?],
    .payload.issue.comments? // .payload.pull_request.comments? // null,
    .payload.review.author_association // .payload.issue.author_association? // .payload.pull_request.author_association? // null,
    .payload.issue.closed_at? // .payload.pull_request.closed_at? // null,
    .payload.pull_request.merged_at? // null,
    .payload.pull_request.merge_commit_sha? // null,
    [.payload.pull_request.requested_reviewers?[]?.login],
    [.payload.pull_request.requested_teams?[]?.name],
    .payload.pull_request.head?.ref? // null,
    .payload.pull_request.head?.sha? // null,
    .payload.pull_request.base?.ref? // null,
    .payload.pull_request.base?.sha? // null,
    .payload.pull_request.merged? // null,
    .payload.pull_request.mergeable? // null,
    .payload.pull_request.rebaseable? // null,
    .payload.pull_request.mergeable_state? // null,
    .payload.pull_request.merged_by?.login? // null,
    .payload.pull_request.review_comments? // null,
    .payload.pull_request.maintainer_can_modify? // null,
    .payload.pull_request.commits? // null,
    .payload.pull_request.additions? // null,
    .payload.pull_request.deletions? // null,
    .payload.pull_request.changed_files? // null,
    .payload.comment.diff_hunk? // null,
    .payload.comment.original_position? // null,
    .payload.comment.commit_id? // null,
    .payload.comment.original_commit_id? // null,
    .payload.size? // null,
    .payload.distinct_size? // null,
    .payload.member.login? // .payload.member? // null,
    .payload.release?.tag_name? // null,
    .payload.release?.name? // null,
    .payload.review?.state? // null
]' | clickhouse-client --input_format_null_as_default 1 --date_time_input_format best_effort --host ${CLICKHOUSE_HOST} --secure --password ${CLICKHOUSE_PASSWORD} --user ${CLICKHOUSE_USER} --query 'INSERT INTO github.github_events FORMAT JSONCompactEachRow' || echo 'File {} has issues'
" && mv *.json.gz ./gharchive

echo "generating cron entry"

current_dir=$(pwd)

mv /opt/pypi/gharchive/*.gz /data/github/gharchive/