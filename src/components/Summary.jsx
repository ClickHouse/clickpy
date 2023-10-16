
'use client'
import HeatMap from './Charts/HeatMap'
import HorizontalBar from './Charts/HorizontalBar'
import SimpleList from './Charts/SimpleList'
import Image from 'next/image'
import PunchCard from './Charts/PunchCard'
import { useRouter } from 'next/navigation'
import { formatNumber } from '@/utils/utils'

export default function Summary({ packages, recent_releases, emerging_repos, needing_refresh, hot_packages }) {
  const router = useRouter()

  const total_top_downloads = packages.map(p => p.c).reduce((ps, a) => {
    return Number(ps) + Number(a)
  }, 0)

  const total_hot_downloads = hot_packages.map(p => p.z).reduce((ps, a) => {
    return Number(ps) + Number(a)
  }, 0)

  return (
    <div className='flex flex-col grow xl:grid xl:grid-cols-6 gap-4 min-w-[360px] mb-16'>
      <div className='xl:col-span-3 h-[360px]'>
        <HeatMap data={recent_releases}
          title={<div className='flex space-x-2'><Image alt='recent' src='/recent.svg' width={16} height={16} /><span className='text-white font-bold space-x-0.5'>Recent releases</span></div>}
          subtitle={'On popular packages'}
          onClick={(value) => {
            router.push(`/dashboard/${value[1]}`)
          }} />
      </div>
      <div className='justify-self align-self xl:col-span-3 h-[360px]'>
        <HorizontalBar
          data={packages.map(p => {
            return { x: p.project, y: p.c, name: 'counts' }
          }).reverse()}
          title={<div className='flex space-x-2'><Image alt='recent' src='./popular.svg' width={16} height={16} /><span className='text-white font-bold space-x-0.5'>Top Repos</span></div>}
          subtitle={`${formatNumber(total_top_downloads)} downloads`}
          onClick={(value) => {
            router.push(`/dashboard/${value}`)
          }}
        />
      </div>
      <div className='xl:col-span-2'>
        <SimpleList link_prefix={'/dashboard/'} data={emerging_repos.map(p => { return { title: p.name, subtitle: `${formatNumber(Number(p.c))} downloads in the last 3 months` } })}
          title={<div className='flex space-x-2'><Image alt='recent' src='/emerging.svg' width={16} height={16} /><span className='text-white font-bold space-x-0.5'>Emerging repos</span></div>} subtitle={`Top ${emerging_repos.length}`} />
      </div>
      <div className='xl:col-span-2'>
        <SimpleList link_prefix={'/dashboard/'} data={needing_refresh.map(p => { return { title: p.name, subtitle: `${formatNumber(Number(p.c))} downloads, last updated on ${p.last_updated}` } })}
          title={<div className='flex space-x-2'><Image alt='recent' src='/refresh.svg' width={16} height={16} /><span className='text-white font-bold space-x-0.5'>Needing a refresh</span></div>} subtitle={`Top ${needing_refresh.length}`} />
      </div>
      <div className='xl:col-span-2'>
        <PunchCard
          data={hot_packages}
          title={<div className='flex space-x-2'><Image alt='recent' src='/hot.svg' width={16} height={16} /><span className='text-white font-bold space-x-0.5'>Hot packages</span></div>}
          subtitle={`${formatNumber(total_hot_downloads)} downloads`}
          stack={true}
          labelMargin={200}
          onClick={(value) => {
            router.push(`/dashboard/${value[1]}`)
          }}
          scale='log'
        />
      </div>
    </div>
  )
}
