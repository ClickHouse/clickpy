import React from 'react';
import { getGithubStats } from '@/utils/clickhouse';
import SimpleStat from './Charts/SimpleStat';

async function GithubStats({
  package_name, min_date, max_date
}) {
  const data = await getGithubStats(package_name, min_date, max_date)
  console.log(data.data.rows)
  return (
    <div className='flex h-full gap-4 flex-row flex-wrap xl:flex-nowrap'>
        <div className='flex gap-4 w-full sm:flex-row flex-col'>
            <SimpleStat value={data.data.rows[0][1]} subtitle={'# Github stars'} logo={'/stars.svg'} link='https://google.com'/>
            <SimpleStat value={10} subtitle={'# Pull requests'} logo={'/prs.svg'} link='https://google.com'/>

        </div>
        <div className='flex gap-4 w-full sm:flex-row flex-col'>
            <SimpleStat value={10} subtitle={'# Issues'} logo={'/issues.svg'} link='https://google.com'/>
            <SimpleStat value={10} subtitle={'# Forks'} logo={'/fork.svg'} link='https://google.com'/>
        </div>
    </div>
  );
}

export default GithubStats;
