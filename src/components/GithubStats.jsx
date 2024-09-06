import React from 'react';
import { getGithubStats, getGithubStatsEndpoint, getGithubStarsOverTime } from '@/utils/clickhouse';
import SimpleStat from './Charts/SimpleStat';
import Spark from './Charts/Spark';


async function getStats(package_name, min_date, max_date) {
  if (process.env.USE_ENDPOINT == 'true') {
      const resp = await getGithubStatsEndpoint(package_name, min_date, max_date)
      return [null,1,resp.stars, resp.prs, resp.issues, resp.forks]
      return []
  } 
  let sResp = await getGithubStats(package_name, min_date, max_date)
  if (sResp[1].length > 0){
    return [sResp[0], sResp[1][0].id, sResp[1][0].pr_creators, sResp[1][0].prs, sResp[1][0].issues, sResp[1][0].forks]
  }
  return []
}

async function GithubStats({
  package_name, min_date, max_date
}) {
  const data = await Promise.all([getStats(package_name, min_date, max_date), getGithubStarsOverTime(package_name, min_date, max_date)])
  const stats = data[0]
  const stars_over_time = data[1]
  return stats.length > 0 && stats[1] ?  (
    <div className='flex h-full w-full mx-auto flex-col lg:grid lg:grid-cols-3 gap-6 '>
        <div className='flex flex-col gap-4 lg:col-span-2 md:h-[208px]'>
          <div className='flex gap-4 w-full sm:flex-row flex-col'>          
              <SimpleStat value={stats[3]} subtitle={'# Pull requests'} logo={'/prs.svg'} link={stats[0]}/>
              <SimpleStat value={stats[2]} subtitle={'# PR request openers'} logo={'/users.svg'} link={stats[0]}/>
          </div>
          <div className='flex gap-4 w-full sm:flex-row flex-col'>
              <SimpleStat value={stats[4]} subtitle={'# Issues'} logo={'/issues.svg'} link={stats[0]}/>
              <SimpleStat value={stats[5]} subtitle={'# Forks'} logo={'/fork.svg'} link={stats[0]}/>
          </div>
        </div>
        <div className='lg:col-span-1 w-full h-[208px]'>
          <Spark data = {stars_over_time[1]} link={stars_over_time[0]}/>
        </div>
    </div>
  ) : null;
}

export default GithubStats;
