'use client';
import React, { useRef, useState } from 'react';
import ReactECharts from './ReactEChartsNoSSR';
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
      },
      axisLabel: {
        color: '#656565',
        formatter: (value, index) => {
            return formatQuantity(value);
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
      className='h-full rounded-lg cursor-pointer shadow-inner justify-between flex flex-col rounded-lg bg-slate-850 border border-slate-700 bg-[url("/stars_background.png")] bg-cover'
      onMouseMove={onMouseOver}
      onMouseOut={onMouseOut}>
        <div className='flex px-[8px] pt-[6px] pb-4 flex justify-between text-left'>
          <div className='flex items-center'>
            <Image
              width={8}
              height={8}
              className='h-6 w-6 min-w-6 min-h-6 bg-neutral-850 rounded-lg'
              src={'/star.svg'}
              alt={'stars'}
            />
            <p
              className={`text-left ml-2 duration-300 text-slate-850 text-2xl font-bold`}>
              {(data && data.length > 0) ? formatQuantity(data[data.length - 1].y): 0} <span className='text-base font-normal'>({(data && data.length > 0) ? `+${data[data.length - 1].y - data[0].y }`: ''} )</span>
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
