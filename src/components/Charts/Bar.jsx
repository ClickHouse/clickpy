'use client';
import React, { useRef, useState } from 'react';
import ReactECharts from 'echarts-for-react';
import isEqual from 'lodash/isEqual';
import Loading from '../Loading';
import Link from 'next/link';
import {
  ArrowTopRightOnSquareIcon,
} from '@heroicons/react/20/solid';

export default function Bar({ data, stack, onSelect, link }) {
  const [loading, setLoading] = useState(true);
  const xAxis = Array.from(new Set(data.map((p) => p.x)));
  const values = data.reduce((accumulator, val) => {
    if (!(val.name in accumulator)) {
      accumulator[val.name] = {
        name: val.name,
        data: new Array(xAxis.length).fill(0)
      };
    }
    return accumulator;
  }, {});

  data.forEach((p) => (values[p.name].data[xAxis.indexOf(p.x)] = p.y));

  const chartRef = useRef();
  const colors = [
    '#FAFF69',
    '#FC74FF',
    '#74ACFF',
    '#74FFD5',
    '#FF7C74',
    '#74FF9B',
    '#FFE074',
    '#CF4B4B'
  ];
  const mappedColors = {};
  const series = Object.values(values).map((series, i) => {
    let color = colors[i % colors.length];
    if (series.name in mappedColors) {
      color = mappedColors[series.name];
    } else {
      mappedColors[series.name] = color;
    }
    return stack
      ? {
          type: 'bar',
          name: series.name,
          data: series.data,
          color: color,
          stack: 'series'
        }
      : {
          type: 'bar',
          name: series.name,
          data: series.data,
          color: color
        };
  });

  const options = {
    animation: false,
    grid: {
      left: '80px',
      right: '24px'
    },
    tooltip: {
      trigger: 'item',
      textStyle: {
        color: '#FAFF69',
        fontWeight: 'bold',
        fontSize: 16,
        lineHeight: 24
      },
      backgroundColor: '#181818',
      borderWidth: 0
    },
    xAxis: {
      show: true,
      type: 'category',
      data: xAxis
    },
    legend: {
      top: '5%',
      left: '84px',
      orient: 'vertical',
      textStyle: {
        color: '#FFFFFFF',
        fontSize: 16
      },
      icon: 'circle',
      backgroundColor: '#3F3F3F',
      borderRadius: 5,
      borderWidth: 1,
      borderColor: '#626262',
      padding: 10
    },
    yAxis: {
      splitLine: {
        show: true,
        lineStyle: {
          color: '#808691',
          opacity: 0.3
        }
      }
    },
    series: series,
    brush: {
      toolbox: ['lineX', 'clear'],
      brushType: 'lineX',
      brushMode: 'single',
      transformable: false
    }
  };

  const onMouseOver = () => {
    const echartsInstance = chartRef.current.getEchartsInstance();
    echartsInstance.dispatchAction({
      type: 'takeGlobalCursor',
      key: 'brush',
      brushOption: {
        brushType: 'lineX'
      }
    });
  };

  const onBrushEnd = (params) => {
    if (params.areas.length > 0) {
      const echartsInstance = chartRef.current.getEchartsInstance();
      let start = echartsInstance.convertFromPixel(
        { xAxisIndex: 0 },
        params.areas[0].range[0]
      );
      let end = echartsInstance.convertFromPixel(
        { xAxisIndex: 0 },
        params.areas[0].range[1]
      );
      start = start > 0 ? start : 0;
      end = end < xAxis.length ? end : xAxis.length - 1;
      onSelect && onSelect(xAxis[start], xAxis[end]);
    }
  };

  const onChartReady = (echarts) => {
    setLoading(false);
  };

  return (
    <div
      className='relative rounded-lg bg-slate-850 border border-slate-700 h-full justify-between flex flex-col'
      onMouseOver={onMouseOver}>

      <div className='px-[4px] pt-[4px] flex-row flex justify-end'>
          { link && <Link href={link} target='_blank' className='w-5 ml-5'>
              <ArrowTopRightOnSquareIcon className='h-5 w-5 flex-none text-primary' aria-hidden='true'/>
          </Link>}   
      </div>

      <ReactECharts
        ref={chartRef}
        option={options}
        style={{ width: '100%', height: '100%' }}
        lazyUpdate
        onChartReady={onChartReady}
        onEvents={{
          brushEnd: onBrushEnd
        }}
        shouldSetOption={(prevProps, currentProps) => {
          const shouldRender = !isEqual(prevProps, currentProps);
          if (shouldRender) {
            setLoading(true);
          }

          return shouldRender;
        }}
      />
      {loading && <Loading />}
    </div>
  );
}
