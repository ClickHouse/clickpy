'use client'
import Bar from '@/components/charts/bar'
import Line from '@/components/charts/line'
import MultiLine from '@/components/charts/multiline'
import Pie from '@/components/charts/pie'
import CountryMap from '@/components/charts/map'
import DatePicker from '@/components/datepicker'
import Filter from '@/components/filter'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import Radar from '@/components/charts/radar'
import Guage from '@/components/charts/guage'

export default function ClientComponent ({type, data, options={}}) {
    const router = useRouter()
    const searchParams = useSearchParams()
    const pathname = usePathname()
    const current = new URLSearchParams(searchParams.toString())
    return (
        {
            'bar': <Bar data={data} stack={options.stack} onSelect={(min_date, max_date) => {
                current.set('min_date', min_date)
                current.set('max_date', max_date)
                router.push(`${pathname}?${current.toString()}`, { scroll: false })
            }}/>,
            'pie': <Pie data={data} onClick={(value) => {
                current.set(options.filter_name, value)
                router.push(`${pathname}?${current.toString()}`, { scroll: false })
                
            }}/>,
            'line': <Line data={data} onSelect={(min_date, max_date) => {
                current.set('min_date', min_date)
                current.set('max_date', max_date)
                router.push(`${pathname}?${current.toString()}`, { scroll: false })
            }}/>,
            'date_picker': <DatePicker dates={data} clearable={current.get('min_date') || current.get('max_date')} onChange={(min_date, max_date) => {
                min_date ? current.set('min_date', min_date): current.delete('min_date')
                max_date ? current.set('max_date', max_date): current.delete('max_date')
                router.push(`${pathname}?${current.toString()}`, { scroll: false })
            }}/>,
            'filter': <Filter value={data} icon={options.icon} name={options.name} onRemove={() => {
                current.delete(options.name)
                router.push(`${pathname}?${current.toString()}`, { scroll: false })
            }}/>,
            'map': <CountryMap data={data} selected={current.get('country_code')} onClick={ (country_code) => {
                current.set('country_code', country_code)
                router.push(`${pathname}?${current.toString()}`, { scroll: false })
            }}/>,
            'radar': <Radar data={data}/>,
            'guage': <Guage data={data}/>,
            'multiline': <MultiLine data={data} stack={options.stack} fill={options.fill} onSelect={(min_date, max_date) => {
                current.set('min_date', min_date)
                current.set('max_date', max_date)
                router.push(`${pathname}?${current.toString()}`, { scroll: false })
            }}/>
        }[type]
    )
}