'use client'
import React, { useRef } from 'react'
import ReactECharts from 'echarts-for-react'
import { chartLoadingOption, onChartReady } from '@/utils/chartsUtils'

export default function Bar({ data, stack, onSelect }) {
  const xAxis = Array.from(new Set(data.map((p) => p.x)))
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

  const chartRef = useRef();
  const colors = ['#FCFF74', '#FC74FF', '#74ACFF', '#74FFD5', '#FF7C74', '#74FF9B', '#FFE074', '#CF4B4B'];
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
        stack: 'series',
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
      left: '80px',
      right: '24px',
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
      show: true,
      type: 'category',
      data: xAxis,
    },
    legend: {
      top: '5%',
      left: '84px',
      orient: 'vertical',
      textStyle: {
        color: '#FFFFFFF',
        fontSize: 16,
      },
      icon: 'circle',
      backgroundColor: '#3F3F3F',
      borderRadius: 5,
      borderWidth: 1,
      borderColor: '#626262',
      padding: 10,
    },
    yAxis: {
      splitLine: {
        show: true,
        lineStyle: {
          color: '#808691',
          opacity: 0.3,
        },
      },
    },
    series: series,
    brush: {
      toolbox: ['lineX', 'clear'],
      brushType: 'lineX',
      brushMode: 'single',
      transformable: false,
    },
  }

  const onMouseOver = () => {
    const echartsInstance = chartRef.current.getEchartsInstance()
    echartsInstance.dispatchAction({
      type: 'takeGlobalCursor',
      key: 'brush',
      brushOption: {
        brushType: 'lineX',
      },
    })
  }

  const onBrushEnd = (params) => {
    if (params.areas.length > 0) {
      const echartsInstance = chartRef.current.getEchartsInstance()
      let start = echartsInstance.convertFromPixel(
        { xAxisIndex: 0 },
        params.areas[0].range[0]
      )
      let end = echartsInstance.convertFromPixel(
        { xAxisIndex: 0 },
        params.areas[0].range[1]
      )
      start = start > 0 ? start : 0
      end = end < xAxis.length ? end : xAxis.length - 1
      onSelect && onSelect(xAxis[start], xAxis[end]);
    }
  }

  return (
    <div
      className='rounded-lg bg-slate-850 border border-slate-700 rounded-l h-full justify-between flex flex-col'
      onMouseOver={onMouseOver}
    >
      <ReactECharts
        ref={chartRef}
        option={options}
        style={{ width: '100%', height: '100%' }}
        lazyUpdate
        showLoading
        loadingOption={chartLoadingOption}
        onChartReady={onChartReady}
        onEvents={{
          brushEnd: onBrushEnd,
        }}
      />
    </div>
  );
}
