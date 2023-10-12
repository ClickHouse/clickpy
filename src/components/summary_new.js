

import { getProjectCount, getRecentReleases, getEmergingRepos } from '@/utils/clickhouse'
import 'server-only'
import SparkLine from './charts/sparkline'
import HeatMap from './charts/heatmap'
import HorizontalBar from './charts/horizontal_bar'
import SimpleList from './charts/simple_list'

export default async function SummaryNew() {
    const packages = await getProjectCount()
    const total_top_downloads = packages.map(p => p.c).reduce((ps, a) => {
        return Number(ps) + Number(a)
    }, 0)
    const [recent_releases, emerging_repos] = await Promise.all(
        [
            getRecentReleases(packages.map(p => p.project)),
            getEmergingRepos()
        ]
    )

    

    return (
        <div className='flex flex-col grow lg:grid lg:grid-cols-6 lg:grid-rows-2 gap-4 lg:h-[680px] lg:min-h-[680px] min-w-[350px]'>
          <div className='lg:col-span-3'>
            <HeatMap data={recent_releases} title={'Recent releases'} subtitle={'On popular packages'}/>
          </div>
          <div className='justify-self align-self lg:col-span-3'>
          <HorizontalBar
            data={packages.map(p => {
                return {x: p.project, y: p.c, name: 'counts'}
            }).reverse()}
            title={'Top Repos'}
            subtitle={`${Math.round(total_top_downloads/1000000)/1000}B downloads`}
          />
          </div>
          <div className='lg:col-span-2 lg:h-[240px]'>
            <SimpleList data={emerging_repos.map(p => { return { title: p.name, subtitle: `${Number(p.c).toLocaleString('en-US')} downloads in the last 3 months` } })} title={'Emerging repos'} subtitle={'Top 5'}/>
          </div>
          <div className='lg:col-span-2 lg:h-[240px]'>
            <SimpleList data={emerging_repos} title={'Emerging repos'} subtitle={'Top 5'}/>
          </div>
          <div className='lg:col-span-2 lg:h-[240px]'>
            <SimpleList data={emerging_repos} title={'Emerging repos'} subtitle={'Top 5'}/>
          </div>
        </div>
    )
}