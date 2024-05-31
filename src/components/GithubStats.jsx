import React from 'react';
import { getGithubStats, getGithubStatsEndpoint } from '@/utils/clickhouse';
import SimpleStat from './Charts/SimpleStat';

async function getStats(package_name, min_date, max_date) {
  if (process.env.USE_ENDPOINT == 'true') {
      const resp = await getGithubStatsEndpoint(package_name, min_date, max_date)
      if (resp.data.rows.length > 0) {
        // no link yet for endpoint
        return [null,resp.data.rows[0][0], resp.data.rows[0][1], resp.data.rows[0][2], resp.data.rows[0][3]]
      }
      return []
  } 
  let sResp = await getGithubStats(package_name, min_date, max_date)
  if (sResp[1].length > 0){
    return [sResp[0], sResp[1][0].stars, sResp[1][0].prs, sResp[1][0].issues,sResp[1][0].forks]
  }
  return []
}

async function GithubStats({
  package_name, min_date, max_date
}) {
  const stats = await getStats(package_name, min_date, max_date)
  return stats.length > 0 ?  (
    <div className='flex h-full gap-4 flex-row flex-wrap xl:flex-nowrap'>
        <div className='flex gap-4 w-full sm:flex-row flex-col'>
            <SimpleStat value={stats[1]} subtitle={'# Github stars'} logo={'/stars.svg'} link={stats[0]}/>
            <SimpleStat value={stats[2]} subtitle={'# Pull requests'} logo={'/prs.svg'} link={stats[0]}/>

        </div>
        <div className='flex gap-4 w-full sm:flex-row flex-col'>
            <SimpleStat value={stats[3]} subtitle={'# Issues'} logo={'/issues.svg'} link={stats[0]}/>
            <SimpleStat value={stats[4]} subtitle={'# Forks'} logo={'/fork.svg'} link={stats[0]}/>
        </div>
    </div>
  ) : null;
}

export default GithubStats;
