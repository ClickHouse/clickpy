'use client'
import React, { useRef, useState } from 'react'
import ReactECharts from 'echarts-for-react'
import { ArrowTopRightOnSquareIcon } from '@heroicons/react/20/solid'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function SparkLine({ name, data, total, link }) {
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
    router.push(link)
  }

	const onMouseOver = () => {
		const echartsInstance = chartRef.current.getEchartsInstance()
		const newOptions = echartsInstance.getOption()
		newOptions.series[0].lineStyle.opacity = 1
		newOptions.series[0].lineStyle.shadowColor = '#FCFF74'
		newOptions.series[0].lineStyle.shadowOffsetX = 0
		newOptions.series[0].lineStyle.shadowOffsetY = 0
		newOptions.series[0].lineStyle.shadowBlur = 0
		newOptions.series[0].areaStyle = {
			color: {
				type: 'linear',
				x: 0,
				y: 0,
				x2: 0,
				y2: 0.8,
				colorStops: [
					{
						offset: 0,
						color: '#FCFF74',
					},
					{
						offset: 1,
						color: '#343431',
					},
				],
			},
			opacity: 0.1,
		}
		echartsInstance.setOption(newOptions)
		setSelected(true)
	}

	const options = {
		grid: {
			left: '-10%',
			right: '-10%',
			top: 0,
			bottom: 0,
		},
		xAxis: {
			type: 'category',
			data: data.map(p => p.x),
			axisLabel: false,
			axisLine: false,
		},
		yAxis: {
			type: 'value',
			axisLabel: false,
			axisLine: false,
			axisTick: {
				show: false,
			},
			splitLine: {
				show: false,
			},
		},
		series: [
			{
				data: data.map(p => p.y),
				type: 'line',
				smooth: true,
				symbol: 'none',
				areaStyle: null,
				lineStyle: {
					color: '#FCFF74',
					width: 4,
					opacity: 0.4,
					shadowColor: '#333333',
					shadowOffsetX: 0,
					shadowOffsetY: 7,
					shadowBlur: 10,
				},
			},
		],
		tooltip: null,
	}

	const onMouseOut = () => {
		const echartsInstance = chartRef.current.getEchartsInstance()
		echartsInstance.setOption(options)
		setSelected(false)
	}

	return (
		<div
			className='rounded-lg bg-chart hover:bg-chart-hover cursor-pointer shadow-inner border border-slate-800 h-full justify-between flex flex-col hover:shadow-xl transition-all duration-300 ease-in-out'
			onMouseMove={onMouseOver}
			onMouseOut={onMouseOut}
      onClick={onClick}
		>
			<p
				className={`text-right ml-2 mr-2 mt-3 transition-all duration-300 ease-in-out hover:shadow-xl ${
					selected ? 'text-white' : 'text-neutral-500'
				}`}
			>
				{formatQuantity(total)} Downloads
			</p>

			<div className='justify-self-stretch'>
				<ReactECharts
					ref={chartRef}
					option={options}
					style={{ width: '100%', height: '100%' }}
					lazyUpdate={false}
				/>
			</div>
			<div className='mb-3 ml-4 mr-2 flex justify-between text-left'>
				<p className={`${selected ? 'text-white' : 'text-neutral-500'}`}>
					{name}
				</p>
				<Link href={link}>
					<ArrowTopRightOnSquareIcon
						className={`h-6 w-6 ${
							selected ? 'fill-white' : 'fill-neutral-500'
						}`}
						aria-hidden='true'
					/>
				</Link>
			</div>
		</div>
	)
}
