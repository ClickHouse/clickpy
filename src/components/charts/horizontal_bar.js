'use client'
import React, { useRef } from 'react'
import ReactECharts from 'echarts-for-react'

export default function HorizontalBar({ data,  title, subtitle }) {
  const xAxis = Array.from(new Set(data.map((p) => p.x)))
  const chartRef = useRef();
  const options = {
    animation: false,
    grid: {
      left: '80px',
      right: 50,
      top: 10,
      bottom: 35
    },
    tooltip: {
      trigger: 'item',
      textStyle: {
        color: '#FCFF74',
        fontWeight: 'bold',
        fontSize: 16,
        lineHeight: 24,
      },
      backgroundColor: '#181818',
      borderWidth: 0,
    },
    xAxis: {
      splitLine: {
        show: true,
        lineStyle: {
          color: '#808691',
          opacity: 0.3,
        },
      },
    },
    legend: {
      show: false
    },
    yAxis: {
      show: true,
      type: 'category',
      data: xAxis,
    },
    series: [
      {
        type: 'bar',
        data: data.map(p => p.y),
        color: '#FCFF74',
      } 
    ],
  }

  const onMouseOver = () => {
    const echartsInstance = chartRef.current.getEchartsInstance()

  }


  return (
    <div
      className='rounded-lg bg-slate-850 border border-slate-700 rounded-l h-full justify-between flex flex-col'
      onMouseOver={onMouseOver}
    >
      {
        title && (
          <div className='px-6 pt-4 pb-0 flex-row flex justify-between'>
              <p className='transition-all duration-300 ease-in-out hover:shadow-xl text-white font-bold'>
                  {title}
              </p>
              <p className={'transition-all duration-300 ease-in-out hover:shadow-xl text-neutral-500'}>
                  {subtitle}
              </p>
          </div>
        )
      }
      <ReactECharts
        ref={chartRef}
        option={options}
        style={{ width: '100%', height: '100%' }}
      />
    </div>
  );
}
