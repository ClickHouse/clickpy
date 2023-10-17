'use client'
import React, { useState } from 'react'
import ReactECharts from 'echarts-for-react'
import isEqual from 'lodash/isEqual'
import Loading from '../Loading'

export default function PunchCard({ data, title, subtitle, onClick, scale = 'linear' }) {
  const [loading, setLoading] = useState(true)
  // we assume data is sorted by x-values
  const xValues = data.map(p => p.x).filter(function (item, pos, ary) {
    return !pos || item != ary[pos - 1]
  }).reverse()
  // sort according to total y-values - largest punches at top
  const yValues = data.reduce((acc, curr) => {
    const { y, z } = curr
    // Check if the key already exists in the accumulator
    const existingObject = acc.find(item => item.y === y)
    if (existingObject) {
      existingObject.z += z
    } else {
      acc.push({ y, z })
    }
    return acc
  }, []).sort((a, b) => b.z - a.z).map(p => p.y).reverse()

  const values = data.reduce((vals, val) => { val.x in vals ? vals[val.x][val.y] = Number(val.z) : vals[val.x] = { [val.y]: Number(val.z) }; return vals; }, {})
  // unique series - we assume they are shorted by series
  const seriesNames = data.map(p => p.name).filter(function (item, pos, ary) {
    return !pos || item != ary[pos - 1]
  })
  const maxSymbolSize = 30
  const maxValue = Math.max(...data.map(p => Number(p.z)))

  const select = (values) => {
    onClick([values.name, yValues[values.value[1]]])
  }

  const options = {
    animation: false,
    grid: {
      left: 120,
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
      formatter: (params) => {
        return `${yValues[params.value[1]]} - ${xValues[params.value[0]]} - ${Number(
          params.value[2]
        ).toLocaleString('en-US')}`
      },

    },
    xAxis: {
      type: 'category',
      data: xValues,
      boundaryGap: false,
      splitLine: {
        show: true,
        lineStyle: {
          color: '#808691',
          opacity: 0.3,
        },
      },
      axisLine: {
        show: false
      }
    },
    legend: {
      show: false
    },
    yAxis: {
      type: 'category',
      data: yValues,
      axisLine: {
        show: false
      },
      splitLine: {
        show: true,
        lineStyle: {
          color: '#808691',
          opacity: 0.3,
        },
      }
    },
    series: [
      {
        type: 'scatter',
        color: 'rgba(252, 255, 116, 1)',
        symbolSize: function (val) {
          if (scale === 'linear') {
            return (Number(val[2]) / maxValue) * maxSymbolSize
          } else if (scale === 'log') {
            if (Number(val[2]) <= 0) {
              return 0
            }
            const scaleFactor = (Math.log(Number(val[2])) / Math.log(maxValue)) * maxSymbolSize
            return Math.min(30, Math.max(0, scaleFactor))
          } else if (scale === 'sqrt') {
            // Calculate the squared scaling factor.
            const scaleFactor = (Number(val[2]) / maxValue) ** 2 * maxSymbolSize
            return Math.min(maxSymbolSize, Math.max(0, scaleFactor))
          }
        },
        data: xValues.map((x, xi) => yValues.map((y, yi) => [xi, yi, y in values[x] ? values[x][y] : 0])).flat(),
        animationDelay: function (idx) {
          return idx * 5
        }
      }
    ]
  }

  const onChartReady = (echarts) => {
    setLoading(false)
  }


  return (
    <div className='relative rounded-lg bg-slate-850 border border-slate-700 rounded-l h-full'>
      {
        title && (
          <div className='px-6 pt-4 pb-0 flex-row flex justify-between'>
            {title}
            <p className={'transition-all duration-300 ease-in-out hover:shadow-xl text-neutral-500'}>
              {subtitle}
            </p>
          </div>
        )
      }
      <ReactECharts
        option={options}
        style={{ width: '100%', height: '100%', minHeight: '320px' }}
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
