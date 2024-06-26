'use client';
import ReactECharts from 'echarts-for-react';
import isEqual from 'lodash/isEqual';
import Loading from '../Loading';
import { useState } from 'react';
import Link from 'next/link';
import {
  ArrowTopRightOnSquareIcon,
} from '@heroicons/react/20/solid';

export default function Radar({ data, onClick, link }) {
  const [loading, setLoading] = useState(true);
  const maxValues = data.reduce((acc, obj) => {
    let { name, value } = obj;
    value = Number(value);
    if (!(name in acc) || value > acc[name]) {
      acc[name] = value;
    }
    return acc;
  }, {});
  const xValues = Object.keys(maxValues);
  const yValues = Array.from(new Set(data.map((p) => p.y)));
  const colors = ['#FAFF69', '#FC74FF', '#74ACFF', '#74FFD5'];
  const options = {
    animation: false,
    tooltip: {
      trigger: 'item',
      textStyle: {
        color: '#FAFF69',
        fontWeight: 'bold',
        fontSize: 14,
        lineHeight: 24
      },
      backgroundColor: '#181818',
      borderWidth: 0
    },
    legend: {
      data: yValues,
      align: 'left',
      left: '20px',
      top: '20px',
      orient: 'vertical',
      icon: 'circle',
      backgroundColor: '#626262',
      borderRadius: 5,
      borderWidth: 1,
      padding: 10,
      textStyle: {
        fontSize: 16,
        color: '#FFFFFFF'
      }
    },
    radar: {
      // shape: 'circle',
      indicator: xValues.map((x) => {
        return {
          name: x,
          value: maxValues[x]
        };
      })
    },
    series: [
      {
        type: 'radar',
        lineStyle: {
          width: 3
        },
        areaStyle: {
          opacity: 0.2
        },
        data: yValues.map((y, i) => {
          const values = data
            .filter((obj) => obj.y === y)
            .reduce((acc, obj) => {
              acc[obj.name] = obj.value;
              return acc;
            }, {});

          return {
            value: xValues.map((x) => (x in values ? values[x] : 0)),
            name: y,
            lineStyle: {
              color: colors[i]
            },
            itemStyle: {
              color: colors[i]
            }
          };
        })
      }
    ]
  };

  const select = (params) => {
    onClick && onClick(params.name);
  };

  const onChartReady = (echarts) => {
    setLoading(false);
  };

  return (
    <div className='relative rounded-lg bg-slate-850 border border-slate-700 h-full'>
      <div className='px-[4px] pt-[4px] flex-row flex justify-end'>
          { link && <Link href={link} target='_blank' className='w-5 ml-5'>
              <ArrowTopRightOnSquareIcon className='h-5 w-5 flex-none icon-hover' aria-hidden='true'/>
          </Link>}   
      </div> 
      <ReactECharts
        option={options}
        style={{ width: '100%', height: '100%' }}
        lazyUpdate
        onChartReady={onChartReady}
        onEvents={{ click: select }}
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
