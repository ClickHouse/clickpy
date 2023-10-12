

import { getProjectCount, getRecentReleases, getPopularEmergingRepos, getPopularReposNeedingRefresh, hotPackages } from '@/utils/clickhouse'
import 'server-only'
import HeatMap from './charts/heatmap'
import HorizontalBar from './charts/horizontal_bar'
import SimpleList from './charts/simple_list'
import recentIcon from './recent.svg'
import popularIcon from './popular.svg'
import emergingIcon from './emerging.svg'
import refreshIcon from './refresh.svg'
import hotIcon from './hot.svg'
import Image from 'next/image'
import PunchCard from './charts/punch_card'

export default async function Summary() {
    const packages = await getProjectCount()
    const total_top_downloads = packages.map(p => p.c).reduce((ps, a) => {
        return Number(ps) + Number(a)
    }, 0)
    const [recent_releases, emerging_repos, needing_refresh, hot_packages] = await Promise.all(
        [
            getRecentReleases(packages.map(p => p.project)),
            getPopularEmergingRepos(),
            getPopularReposNeedingRefresh(),
            hotPackages()
        ]
    )
    const total_hot_downloads = hot_packages.map(p => p.z).reduce((ps, a) => {
      return Number(ps) + Number(a)
  }, 0)

        
  return (
      <div className='flex flex-col grow lg:grid lg:grid-cols-6 lg:grid-rows-2 gap-4 lg:h-[680px] lg:min-h-[680px] min-w-[350px]'>
        <div className='lg:col-span-3'>
          <HeatMap data={recent_releases} title={<div className='flex space-x-2'><Image alt='recent' src={recentIcon}/><span className='text-white font-bold space-x-0.5'>Recent releases</span></div>} subtitle={'On popular packages'}/>
        </div>
        <div className='justify-self align-self lg:col-span-3'>
        <HorizontalBar
          data={packages.map(p => {
              return {x: p.project, y: p.c, name: 'counts'}
          }).reverse()}
          title={<div className='flex space-x-2'><Image alt='recent' src={popularIcon}/><span className='text-white font-bold space-x-0.5'>Top Repos</span></div>}
          subtitle={`${Math.round(total_top_downloads/1000000)/1000}B downloads`}
        />
        </div>
        <div className='lg:col-span-2 lg:h-[240px]'>
          <SimpleList data={emerging_repos.map(p => { return { title: p.name, subtitle: `${Math.round(Number(p.c)/10000)/100}M downloads in the last 3 months` } })} 
          title={<div className='flex space-x-2'><Image alt='recent' src={emergingIcon}/><span className='text-white font-bold space-x-0.5'>Emerging repos</span></div>} subtitle={'Top 5'}/>
        </div>
        <div className='lg:col-span-2 lg:h-[240px]'>
          <SimpleList data={needing_refresh.map(p => { return { title: p.name, subtitle: `${Math.round(Number(p.c)/10000000)/100}B downloads, last updated on ${p.last_updated}` } })} 
          title={<div className='flex space-x-2'><Image alt='recent' src={refreshIcon}/><span className='text-white font-bold space-x-0.5'>Needing a refresh</span></div>} subtitle={'Top 5'}/>
        </div>
        <div className='lg:col-span-2 lg:h-[240px]'>
          <PunchCard
            data={hot_packages}
            title={<div className='flex space-x-2'><Image alt='recent' src={hotIcon}/><span className='text-white font-bold space-x-0.5'>Hot packages</span></div>}
            subtitle={`${Math.round(total_hot_downloads/1000)/1000}M downloads`}
            stack={true}
            labelMargin={200}
          />
        </div>
      </div>
  )
}