'use client';
import React, { useRef, useState } from 'react';
import ReactECharts from 'echarts-for-react';
import { ArrowTopRightOnSquareIcon } from '@heroicons/react/20/solid';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import isEqual from 'lodash/isEqual';
import Image from 'next/image';

export default function Spark({ name, data, link, type='bar' }) {
  const chartRef = useRef();
  const [selected, setSelected] = useState(false);

  const formatQuantity = (value) => {
    if (value > 1000) {
      return `${Math.round(value / 100)/10}k`
    }
    return value;
  };

  const onMouseOver = () => {
    const echartsInstance = chartRef.current.getEchartsInstance();
    const newOptions = echartsInstance.getOption();
    newOptions.series[0].lineStyle.opacity = 0.8;
    newOptions.series[0].lineStyle.shadowColor = '#262626';
    newOptions.series[0].lineStyle.shadowOffsetX = 0;
    newOptions.series[0].lineStyle.shadowOffsetY = 0;
    newOptions.series[0].lineStyle.shadowBlur = 0;
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
            color: '#FAFF69'
          },
          {
            offset: 1,
            color: '#343431'
          }
        ]
      },
      opacity: 0.1
    };
    echartsInstance.setOption(newOptions);
    setSelected(true);
  };
  const xAxis = data.map((p) => p.x);
  const options = {
    grid: {
      left: '50px',
      right: '24px',
      bottom: '36px',
      top: '10px'
    },
    xAxis: {
      type: 'category',
      data: data.map((p) => p.x),
      show: true,
      type: 'category',
      data: xAxis,
      nameLocation: 'middle',
      min: 0,
      max: xAxis.length - 1,
      axisLine: {
        lineStyle: {
          color: '#656565'
        }
      }
    },
    yAxis: {
      type: 'value',
      splitLine: {
        show: true,
        lineStyle: {
          color: 'slate-850',
          opacity: 0.3
        }
      },
      axisLine: {
        lineStyle: {
          color: '#656565'
        }
      }
    },
    series: [
      {
        data: data.map((p) => p.y),
        type: type,
        smooth: true,
        symbol: 'none',
        color: '#262626',
        lineStyle: {
          color: '#262626',
          width: 3,
          opacity: 0.6,
          shadowColor: '#333333',
          shadowOffsetX: 0,
          shadowOffsetY: 0,
        },
        areaStyle: null
      }
    ],
    tooltip: null
  };

  const onMouseOut = () => {
    const echartsInstance = chartRef.current.getEchartsInstance();
    echartsInstance.setOption(options);
    setSelected(false);
  };

  return (
    <div
      className='rounded-lg cursor-pointer shadow-inner h-full justify-between flex flex-col rounded-lg bg-slate-850 border border-slate-700 bg-[url("/stars_background.png")]'
      onMouseMove={onMouseOver}
      onMouseOut={onMouseOut}>
        <div className='flex px-[6px] pt-[6px] pb-4 flex justify-between text-left'>
          <div className='flex'>
            <Image
              width={8}
              height={8}
              className='h-8 w-8 min-w-8 min-h-8 bg-neutral-850 rounded-lg'
              src={'/stars.svg'}
              alt={'stars'}
            />
            <p
              className={`text-left ml-2 duration-300 text-slate-850 text-2xl font-bold`}>
              {formatQuantity(data[data.length - 1].y)}
            </p>
          </div>
          <Link href={link} target='_blank'>
            <ArrowTopRightOnSquareIcon className='h-5 w-5 flex-none icon-hover-2' aria-hidden='true'/>
          </Link>
        </div>
        <ReactECharts
            ref={chartRef}
            option={options}
            style={{ width: '100%', height: '100%' }}
            lazyUpdate
            shouldSetOption={(prevProps, currentProps) => {
              const shouldRender = !isEqual(prevProps, currentProps);
              return shouldRender;
            }}
          />

    </div>
  );
}
