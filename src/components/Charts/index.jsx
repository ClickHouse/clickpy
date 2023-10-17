'use client'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import Bar from './Bar'
import Line from './Line'
import MultiLine from './MultiLine'
import Pie from './Pie'
import CountryMap from './CountryMap'
import Radar from './Radar'
import Guage from './Guage'

export default function ClientComponent({ type, data = [], options = {} }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const pathname = usePathname()
  const current = new URLSearchParams(searchParams.toString())
  return {
    'bar': (
      <Bar
        data={data}
        stack={options.stack}
        onSelect={(min_date, max_date) => {
          current.set('min_date', min_date)
          current.set('max_date', max_date)
          router.push(`${pathname}?${current.toString()}`, { scroll: false })
        }}
      />
    ),
    'pie': (
      <Pie
        data={data}
        onClick={(value) => {
          current.set(options.filter_name, value)
          router.push(`${pathname}?${current.toString()}`, { scroll: false })
        }}
      />
    ),
    'line': (
      <Line
        data={data}
        onSelect={(min_date, max_date) => {
          current.set('min_date', min_date)
          current.set('max_date', max_date)
          router.push(`${pathname}?${current.toString()}`, { scroll: false })
        }}
      />
    ),
    'map': (
      <CountryMap
        data={data}
        selected={current.get('country_code')}
        onClick={(country_code) => {
          current.set('country_code', country_code)
          router.push(`${pathname}?${current.toString()}`, { scroll: false })
        }}
      />
    ),
    'radar': (<Radar data={data} onClick={(value) => {
      current.set(options.column, value)
      router.push(`${pathname}?${current.toString()}`, { scroll: false })
    }}/>),
    'guage': (<Guage data={data} />),
    'multiline': (
      <MultiLine
        data={data}
        stack={options.stack}
        fill={options.fill}
        onSelect={(min_date, max_date) => {
          current.set('min_date', min_date)
          current.set('max_date', max_date)
          router.push(`${pathname}?${current.toString()}`, { scroll: false })
        }}
      />
    )
  }[type]
}
