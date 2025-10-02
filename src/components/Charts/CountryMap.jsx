'use client';
import ReactECharts from 'echarts-for-react';
import 'echarts-countries-js/echarts-countries-js/world';
import isEqual from 'lodash/isEqual';
import Loading from '../Loading';
import { useState } from 'react';
import Link from 'next/link';
import {
  ArrowTopRightOnSquareIcon,
} from '@heroicons/react/20/solid';
import CopyDropdown from '../CopyDropdown';

export default function CountryMap({ data, selected, onClick, link, metabaseLink }) {
  const [loading, setLoading] = useState(true);

  const scaledValues = data.map((p) => {
    return {
      name: p.name,
      value: Math.sqrt(p.value),
      label: p.value,
      code: p.country_code,
      selected: p.country_code == selected
    };
  });

  const values = scaledValues.map((p) => Number(p.value));
  const options = {
    colorBy: selected == null ? 'series' : 'data',
    color: selected
      ? ['#2F2F2F']
      : ['#FAFF69', '#DDE26B', '#B2B661', '#8A8C5A', '#51523B', '#2F2F2F'],
    animation: false,
    tooltip: {
      trigger: 'item',
      textStyle: {
        color: '#FAFF69',
        fontWeight: 'bold',
        fontSize: 16,
        lineHeight: 24
      },
      backgroundColor: '#181818',
      borderWidth: 0,
      formatter: function (params) {
        if (params.data) {
          return (
            params.name +
            ': ' +
            Number(params.data.label).toLocaleString('en-US')
          );
        }
        return params.name + ': 0';
      }
    },
    series: [
      {
        name: 'Downloads',
        type: 'map',
        map: 'world',
        roam: false,
        height: '80%',
        label: {
          show: false
        },
        select: {
          disabled: false,
          itemStyle: {
            areaColor: '#FFFFFF'
          },
          label: { show: false }
        },
        itemStyle: {
          borderWidth: 0.5,
          borderColor: 'black',
          areaColor: '#343431'
        },
        data: scaledValues,
        emphasis: {
          label: { show: false },
          itemStyle: {
            shadowOffsetX: 0,
            shadowOffsetY: 0,
            shadowBlur: 20,
            shadowColor: 'rgba(0, 0, 0, 0.3)',
            areaColor: '#FEFFBF'
          }
        }
      }
    ]
  };

  if (values.length > 0) {
    options['visualMap'] = {
      min: Math.min(...values),
      max: Math.max(...values),
      text: ['Max', 'Min'],
      textStyle: {
        color: '#626262'
      },
      realtime: false,
      calculable: false,
      color: ['#FAFF69', '#DDE26B', '#B2B661', '#8A8C5A', '#51523B', '#2F2F2F'],
      left: 32,
      bottom: 60,
    };
  }

  const select = (params) => {
    onClick && params.data && onClick(params.data.code);
  };

  const onChartReady = (echarts) => {
    setLoading(false);
  };

  return (
    <div className='relative rounded-lg bg-slate-850 border border-slate-700 h-full'>

      <div className='px-[8px] pt-[8px] flex-row flex justify-end'>
        { metabaseLink && <CopyDropdown link={metabaseLink} />}
          { link && <Link href={link} target='_blank' className='w-5 ml-2'>
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
