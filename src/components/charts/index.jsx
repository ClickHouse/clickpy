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
  if (type === "bar") {
    return (
      <Bar
        data={data}
        stack={options.stack}
        onSelect={(min_date, max_date) => {
          current.set('min_date', min_date)
          current.set('max_date', max_date)
          router.push(`${pathname}?${current.toString()}`, { scroll: false })
        }}
      />
    )
  }
  if (type === "pie") {
    return (
      <Pie
        data={data}
        onClick={(value) => {
          current.set(options.filter_name, value)
          router.push(`${pathname}?${current.toString()}`, { scroll: false })
        }}
      />
    )
  }
  if (type === "line") {
    return (
      <Line
        data={data}
        onSelect={(min_date, max_date) => {
          current.set('min_date', min_date)
          current.set('max_date', max_date)
          router.push(`${pathname}?${current.toString()}`, { scroll: false })
        }}
      />
    )
  }
  if (type === "map") {
    return (
      <CountryMap
        data={data}
        selected={current.get('country_code')}
        onClick={(country_code) => {
          current.set('country_code', country_code)
          router.push(`${pathname}?${current.toString()}`, { scroll: false })
        }}
      />
    )
  }
  if (type === "radar") {
    return <Radar data={data} />
  }
  if (type === "guage") {
    return <Guage data={data} />
  }
  if (type === "multiline") {
    return (
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
  }
  return null
}
