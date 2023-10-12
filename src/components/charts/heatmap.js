'use client'
import React, { useRef, useState } from 'react'
import ReactECharts from 'echarts-for-react'
import { ArrowTopRightOnSquareIcon } from '@heroicons/react/20/solid'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function HeatMap({ data, title, subtitle }) {

const chartRef = useRef()
  const router = useRouter();
	const [selected, setSelected] = useState(false)
  
	const formatQuantity = value => {
		if (value > 1000) {
			return `${value / 1000}B`
		}
		return `${value}M`
	}
  
  const onClick = () => {
      
  }
  const xValues = data.map(p => p.x).filter(function(item, pos, ary) {
      return !pos || item != ary[pos - 1]
  })
  const yValues = data.map(p => p.y).sort().filter(function(item, pos, ary) {
      return !pos || item != ary[pos - 1]
  })

  const values = data.reduce((vals, val) => { val.x in vals ? vals[val.x][val.y] = Number(val.z) : vals[val.x] = {[val.y]: Number(val.z)}; return vals; }, {})
	const options = {
		grid: {
      left: 90,
			top: 0,
      right: 40,
			bottom: 50,
		},
		xAxis: {
			type: 'category',
      offset: 15,
			data: xValues,
      splitArea: {
        show: true
      },
      axisLine: {
        onZero: false,
      }
    },
    toolBox: {
        show:false
    },    
		yAxis: {
			type: 'category',
      offset: 15,
      splitArea: {
        show: true
      },
      data: yValues,
      axisLine: {
        onZero: false,
      }
		},
    visualMap: {
        min: 0,
        max: Math.max(...data.map(p => p.z)),
        calculable: true,
        orient: 'horizontal',
        color: ['rgba(252, 255, 116, 1)','rgba(252, 255, 116, 0.8)','rgba(252, 255, 116, 0.6)','rgba(252, 255, 116, 0.4)','rgba(252, 255, 116, 0.2)', '#262626'],
        show: false,
    },
		series: [
			{
          type: 'heatmap',
          data: xValues.map((x, xi) => yValues.map((y, yi) => [xi,yi, y in values[x] ? values[x][y] : 0])).flat(),
          label: {
            show: false
          },
          emphasis: {
            disabled: true
          },
          itemStyle: {
            borderWidth: 15,
            borderColor: '#262626'
          },
      },
		],
		tooltip: null,
    legend: null
	}

	return (
		<div
			className='rounded-lg bg-slate-850 hover:bg-chart-hover cursor-pointer shadow-inner border border-slate-700 h-full justify-between flex flex-col hover:shadow-xl transition-all duration-300 ease-in-out'
            onClick={onClick}>
            <div className='px-6 py-4  flex-row flex justify-between'>
                <p className='transition-all duration-300 ease-in-out hover:shadow-xl text-white font-bold'>
                    {title}
                </p>
                <p className={'transition-all duration-300 ease-in-out hover:shadow-xl text-neutral-500'}>
                    {subtitle}
                </p>
            </div>

			<div className='justify-self-stretch h-full'>
				<ReactECharts
					ref={chartRef}
					option={options}
					style={{ width: '100%', height: '100%' }}
					lazyUpdate={false}
				/>
			</div>
		</div>
	)
}
