

import { getProjectCount, getRecentReleases, getRecentPackageDownloads } from '@/utils/clickhouse'
import 'server-only'
import SparkLine from './charts/sparkline'
import HeatMap from './charts/heatmap'
import HorizontalBar from './charts/horizontal_bar'

export default async function SummaryNew() {
    const packages = await getProjectCount()
    const total_top_downloads = packages.map(p => p.c).reduce((ps, a) => {
        return Number(ps) + Number(a)
    }, 0)
    const [recent_releases] = await Promise.all(
        [
            getRecentReleases(packages.map(p => p.project)),
        ]
    )
    const downloads = await Promise.all(
        packages.map((p) => getRecentPackageDownloads(p.project))
      )
    const packageData = downloads.map((data, i) => {
    return { name: packages[i].project, data: data, total: packages[i].c };
    })

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
          <div className='lg:col-span-2'>
          <SparkLine
            data={packageData[0].data}
            name={packageData[0].name}
            total={packageData[0].total}
            link={`/dashboard/${packageData[0].name}`}
          />
          </div>
          <div className='lg:col-span-2'>
          <SparkLine
            data={packageData[0].data}
            name={packageData[0].name}
            total={packageData[0].total}
            link={`/dashboard/${packageData[0].name}`}
          />
          </div>
          <div className='lg:col-span-2'>
          <SparkLine
            data={packageData[0].data}
            name={packageData[0].name}
            total={packageData[0].total}
            link={`/dashboard/${packageData[0].name}`}
          />
          </div>
        </div>
    )

}