
'use client'
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
import { useRouter } from 'next/navigation'

export default function Summary({packages, recent_releases, emerging_repos, needing_refresh, hot_packages}) {
  const router = useRouter()
  
  const total_top_downloads = packages.map(p => p.c).reduce((ps, a) => {
      return Number(ps) + Number(a)
  }, 0)
  
  const total_hot_downloads = hot_packages.map(p => p.z).reduce((ps, a) => {
    return Number(ps) + Number(a)
  }, 0)

  const formatNumber = (number) => {
    if (number > 1000000000) {
      return `${Math.round(Number(number)/10000000)/100}B`
    } else if (number > 1000000) {
      return `${Math.round(Number(number)/10000)/100}M`
    }
    return `${number}`
  }
  
  return (
      <div className='flex flex-col grow xl:grid xl:grid-cols-6 gap-4 min-w-[360px] mb-16'>
        <div className='xl:col-span-3 h-[360px]'>
          <HeatMap data={recent_releases} 
            title={<div className='flex space-x-2'><Image alt='recent' src={recentIcon}/><span className='text-white font-bold space-x-0.5'>Recent releases</span></div>} 
            subtitle={'On popular packages'}
            onClick={(value) => {
              router.push(`/dashboard/${value[1]}`)
            }}/>
        </div>
        <div className='justify-self align-self xl:col-span-3 h-[360px]'>
        <HorizontalBar
            data={packages.map(p => {
                return {x: p.project, y: p.c, name: 'counts'}
            }).reverse()}
            title={<div className='flex space-x-2'><Image alt='recent' src={popularIcon}/><span className='text-white font-bold space-x-0.5'>Top Repos</span></div>}
            subtitle={`${formatNumber(total_top_downloads)} downloads`}
            onClick={(value) => {
              router.push(`/dashboard/${value}`)
            }}
        />
        </div>
        <div className='xl:col-span-2'>
          <SimpleList link_prefix={'/dashboard/'} data={emerging_repos.map(p => { return { title: p.name, subtitle: `${formatNumber(Number(p.c))} downloads in the last 3 months` } })} 
          title={<div className='flex space-x-2'><Image alt='recent' src={emergingIcon}/><span className='text-white font-bold space-x-0.5'>Emerging repos</span></div>} subtitle={'Top 5'}/>
        </div>
        <div className='xl:col-span-2'>
          <SimpleList link_prefix={'/dashboard/'} data={needing_refresh.map(p => { return { title: p.name, subtitle: `${formatNumber(Number(p.c))} downloads, last updated on ${p.last_updated}` } })} 
          title={<div className='flex space-x-2'><Image alt='recent' src={refreshIcon}/><span className='text-white font-bold space-x-0.5'>Needing a refresh</span></div>} subtitle={'Top 5'}/>
        </div>
        <div className='xl:col-span-2 min-h-[360px]'>
          <PunchCard
            data={hot_packages}
            title={<div className='flex space-x-2'><Image alt='recent' src={hotIcon}/><span className='text-white font-bold space-x-0.5'>Hot packages</span></div>}
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
