'use client'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import Bar from './Bar'
import Line from './Line'
import MultiLine from './MultiLine'
import Pie from './Pie'
import CountryMap from './CountryMap'
import Radar from './Radar'
import Guage from './Guage'
import { Suspense } from 'react'
import Loading from '../Loading'

export default function ClientComponent({ type, data, options = {} }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const pathname = usePathname()
  const current = new URLSearchParams(searchParams.toString())
  return (
    {
      'bar':
        <Suspense fallback={<Loading />}>
          <Bar
            data={data}
            stack={options.stack}
            onSelect={(min_date, max_date) => {
              current.set('min_date', min_date)
              current.set('max_date', max_date)
              router.push(`${pathname}?${current.toString()}`, { scroll: false })
            }} />
        </Suspense>,
      'pie':
        <Suspense fallback={<Loading />}>
          <Pie
            data={data}
            onClick={(value) => {
              current.set(options.filter_name, value)
              router.push(`${pathname}?${current.toString()}`, { scroll: false })
            }} />
        </Suspense>,
      'line':
        <Suspense fallback={<Loading />}>
          <Line
            data={data}
            onSelect={(min_date, max_date) => {
              current.set('min_date', min_date)
              current.set('max_date', max_date)
              router.push(`${pathname}?${current.toString()}`, { scroll: false })
            }} />
        </Suspense>,
      'map':
        <Suspense fallback={<Loading />}>
          <CountryMap
            data={data}
            selected={current.get('country_code')}
            onClick={(country_code) => {
              current.set('country_code', country_code)
              router.push(`${pathname}?${current.toString()}`, { scroll: false })
            }} />
        </Suspense>,
      'radar':
        <Suspense fallback={<Loading />}>
          <Radar data={data} />
        </Suspense>,
      'guage':
        <Suspense fallback={<Loading />}>
          <Guage data={data} />
        </Suspense>,
      'multiline':
        <Suspense fallback={<Loading />}>
          <MultiLine
            data={data}
            stack={options.stack}
            fill={options.fill}
            onSelect={(min_date, max_date) => {
              current.set('min_date', min_date)
              current.set('max_date', max_date)
              router.push(`${pathname}?${current.toString()}`, { scroll: false })
            }} />
        </Suspense>
    }[type]
  )
}
