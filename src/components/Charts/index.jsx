'use client'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import Bar from './Bar'
import Line from './Line'
import Table from '../DependencyTable'
import MultiLine from './MultiLine'
import Pie from './Pie'
import CountryMap from './CountryMap'
import Radar from './Radar'
import Guage from './Guage'
import Spark from './Spark'
import HorizontalBar from './HorizontalBar'

export default function ClientComponent({ type, data = [], options = {}, link }) {
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
        link={link}
      />
    ),
    'pie': (
      <Pie
        data={data}
        onClick={(value) => {
          current.set(options.filter_name, value)
          router.push(`${pathname}?${current.toString()}`, { scroll: false })
        }}
        link={link}
      />
    ),
    'line': (
      <Line
        data={data}
        onClear={
          () => {
            current.delete('min_date')
            current.delete('max_date')
            router.push(`${pathname}?${current.toString()}`, { scroll: false })
          }
        }
        onSelect={(min_date, max_date) => {
          current.set('min_date', min_date)
          current.set('max_date', max_date)
          router.push(`${pathname}?${current.toString()}`, { scroll: false })
        }}
        link={link}
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
        link={link}
      />
    ),
    'radar': (<Radar data={data} link={link} onClick={(value) => {
      //disable as we need MV
      // current.set(options.column, value)
      // router.push(`${pathname}?${current.toString()}`, { scroll: false })
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
        link={link}
      />
    ),
    'spark': (
      <Spark
          data = {data}
          link={link}
      />
    ),
    'horizontal_bar': (
      <HorizontalBar
        data={data}
        show_icons={options.show_icons}
        link={link}
      />
    )
  }[type]
}
