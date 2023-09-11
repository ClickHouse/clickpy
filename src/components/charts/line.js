'use client';
import React, { useRef, useState } from 'react';
import ReactECharts from 'echarts-for-react';
import styles from './styles.module.css';

export default function Line({ data, onSelect }) {
  const chartRef = useRef()
  const xAxis = data.map((p) => p.x)
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
        y2: 0.65,
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
    echartsInstance.setOption(newOptions);
    echartsInstance.dispatchAction({
      type: 'takeGlobalCursor',
      key: 'brush',
      brushOption: {
        brushType: 'lineX',
      },
    })
  }

  const options = {
    animation: false,
    grid: {
      left: '80px',
      right: '24px',
      bottom: '36px',
    },
    xAxis: {
      show: true,
      type: 'category',
      data: xAxis,
      nameLocation: 'middle',
      min: 0,
      max: xAxis.length - 1,
    },
    yAxis: {
      type: 'value',
      splitLine: {
        show: true,
        lineStyle: {
          color: '#808691',
          opacity: 0.3
        },
      },
    },
    series: [
      {
        data: data.map((p) => p.y),
        type: 'line',
        smooth: true,
        showSymbol: false,
        areaStyle: null,
        lineStyle: {
          color: '#FCFF74',
          width: 3,
          shadowColor: '#000000',
          shadowOffsetX: 0,
          shadowOffsetY: 7,
          shadowBlur: 10,
        },
      },
    ],
    tooltip: {
      trigger: 'axis',
      textStyle: {
        color: '#FCFF74',
        fontWeight: 'bold',
        fontSize: 16,
        lineHeight: 24,
      },
      backgroundColor: 'transparent',
      borderWidth: 0,
      formatter: (params) => {
        return `<div class='${styles.tooltip}'>
                    <span class='${styles.tooltiptext}'>${Number(
          params[0].value
        ).toLocaleString('en-US')}</span>
                </div>`;
      },
      extraCssText: 'visibility: hidden;padding:0px;',
      position: (point, params, dom, rect, size) => {
        const echartsInstance = chartRef.current.getEchartsInstance();
        const pos = echartsInstance.convertToPixel({ seriesIndex: 0 }, [
          params[0].axisValue,
          params[0].value,
        ]);
        return [pos[0], pos[1] - size.contentSize[1] * 2];
      },
    },
    brush: {
      toolbox: ['lineX', 'clear'],
      brushType: 'lineX',
      brushMode: 'single',
      transformable: false,
    },
  }

  const onMouseOut = () => {
    const echartsInstance = chartRef.current.getEchartsInstance();
    echartsInstance.setOption(options);
  }

  const onBrushEnd = (params) => {
    if (params.areas.length > 0) {
      const echartsInstance = chartRef.current.getEchartsInstance();
      const start = echartsInstance.convertFromPixel(
        { xAxisIndex: 0 },
        params.areas[0].range[0]
      );
      const end = echartsInstance.convertFromPixel(
        { xAxisIndex: 0 },
        params.areas[0].range[1]
      );
      onSelect &&
        xAxis[start] &&
        xAxis[end] &&
        onSelect(xAxis[start], xAxis[end]);
    }
  }

  return (
    <div
      className='rounded-lg bg-chart border border-slate-800 rounded-l h-full justify-between flex flex-col'
      onMouseMove={onMouseOver}
      onMouseOut={onMouseOut}
    >
      <ReactECharts
        ref={chartRef}
        option={options}
        style={{ width: '100%', height: '100%' }}
        lazyUpdate={true}
        onEvents={{
          brushEnd: onBrushEnd,
        }}
      />
    </div>
  )
}
