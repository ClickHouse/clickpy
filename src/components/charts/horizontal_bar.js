'use client'
import React, { useRef } from 'react'
import ReactECharts from 'echarts-for-react'

export default function HorizontalBar({ data,  title, subtitle, stack=false, labelMargin = 80 }) {
  const xAxis = Array.from(new Set(data.map((p) => p.x)))
  // unique series - we assume they are shorted by series
  const seriesNames = data.map(p => p.name).filter(function(item, pos, ary) {
    return !pos || item != ary[pos - 1]
  })
  console.log(seriesNames)
  const values = data.reduce((accumulator, val) => {
    if (!(val.name in accumulator)) {
      accumulator[val.name] = {
        name: val.name,
        data: new Array(xAxis.length).fill(0),
      };
    }
    return accumulator;
  }, {})

  data.forEach((p) => (values[p.name].data[xAxis.indexOf(p.x)] = p.y));

  const chartRef = useRef()
  const colors = seriesNames.length === 1 ? ['rgba(252, 255, 116, 1.0)']: ['rgba(252, 255, 116, 0.2)','rgba(252, 255, 116, 0.6)','rgba(252, 255, 116, 1.0)']
  const mappedColors = {}
  const series = Object.values(values).map((series, i) => {
    let color = colors[i % colors.length]
    if (series.name in mappedColors) {
      color = mappedColors[series.name]
    } else {
      mappedColors[series.name] = color
    }
    return stack
      ? {
          type: 'bar',
          name: series.name,
          data: series.data,
          color: color,
          stack: 'total',
        }
      : {
          type: 'bar',
          name: series.name,
          data: series.data,
          color: color,
        }
  })
  const options = {
    animation: false,
    grid: {
      left: labelMargin,
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
      axisLabel: {
        show: true,
      }
    },
    series: seriesNames.map(s => series.find(c => c.name === s)),
  }

    console.log(seriesNames.map(s => series.find(c => c.name === s)))

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
