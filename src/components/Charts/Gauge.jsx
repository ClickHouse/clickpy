'use client'
import React, { useState } from 'react'
import ReactECharts from 'echarts-for-react';
import isEqual from 'lodash/isEqual'
import Loading from '../Loading'

export default function Gauge({ data }) {
  const [loading, setLoading] = useState(true)
  let value = data.ranks.findIndex((value) => value > data.value)
  value = value == -1 ? 0.99 : (value - 1) / 100

  const options = {
    series: [
      {
        type: 'gauge',
        min: 0,
        max: 1,
        splitNumber: 8,
        axisLine: {
          lineStyle: {
            width: 6,
            color: [
              [0.2, '#F6F7FA'],
              [0.4, '#FEFFBA'],
              [0.6, '#FDFFA3'],
              [0.8, '#EEEF40'],
              [1, '#EEEF40'],
            ],
          },
        },
        pointer: {
          icon: 'path://M12.8,0.7l12,40.1H0.7L12.8,0.7z',
          length: '12%',
          width: 20,
          offsetCenter: [0, '-60%'],
          itemStyle: {
            color: 'auto',
          },
        },
        axisTick: {
          length: 12,
          lineStyle: {
            color: 'auto',
            width: 2,
          },
        },
        splitLine: {
          length: 20,
          lineStyle: {
            color: 'auto',
            width: 5,
          },
        },
        axisLabel: {
          color: '#FFFFFF',
          fontSize: 20,
          distance: -60,
          rotate: 'tangential',
          formatter: function (value) {
            if (
              value === 0 ||
              value === 0.75 ||
              value === 0.5 ||
              value === 0.25
            ) {
              return Math.round(value * 100) + '%'
            }
            return ''
          },
        },
        detail: {
          fontSize: 40,
          offsetCenter: [0, '-35%'],
          valueAnimation: false,
          formatter: function (value) {
            return Math.round(value * 100) + '%'
          },
          color: 'inherit',
        },
        title: {
          color: '#FFFFFF',
          fontSize: 24,
        },
        data: [
          {
            value: value,
            name: `${value < 0.5
              ? `Bottom ${Math.round(value * 100)}%`
              : `Top ${Math.round((1 - value) * 100)}%`
              }`,
            itemStyle: {
              fontSize: 40,
            },
          },
        ],
      },
    ],
  }

  const select = (params) => {
    onClick && onClick(params.name)
  }

  const onChartReady = (echarts) => {
    setLoading(false)
  }

  return (
    <div className='relative rounded-lg bg-chart border border-slate-700 h-full'>
      <ReactECharts
        option={options}
        style={{ width: '100%', height: '100%' }}
        lazyUpdate
        onChartReady={onChartReady}
        onEvents={{ click: select }}
        shouldSetOption={(prevProps, currentProps) => {
          const shouldRender = !isEqual(prevProps, currentProps)
          if (shouldRender) {
            setLoading(true)
          }

          return shouldRender
        }}
      />
      {loading && <Loading />}
    </div>
  )
}
