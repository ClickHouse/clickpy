import ReactECharts from 'echarts-for-react';
import Loading from '../Loading';
import isEqual from 'lodash/isEqual';
import { useState } from 'react';
import Link from 'next/link';
import {
  ArrowTopRightOnSquareIcon,
} from '@heroicons/react/20/solid';

export default function Pie({ data, onClick, link }) {
  const [loading, setLoading] = useState(true);
  const options = {
    animation: false,
    grid: {
      left: 0,
      right: 0
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
    legend: {
      bottom: '10%',
      textStyle: {
        color: '#FFFFFFF',
        fontSize: 18
      },
      icon: 'circle',
      icon: 'circle',
      left: '24px',
      backgroundColor: '#3F3F3F',
      borderRadius: 5,
      borderWidth: 1,
      borderColor: '#626262',
      padding: 10
    },
    series: [
      {
        name: 'Distribution types',
        type: 'pie',
        radius: ['50%', '70%'],
        avoidLabelOverlap: true,
        center: ['50%', '40%'],
        label: {
          show: false
        },
        emphasis: {
          label: {
            show: false
          }
        },
        labelLine: {
          show: true
        },
        z: 2,
        itemStyle: {},
        color: [
          '#FAFF69',
          '#FC74FF',
          '#74ACFF',
          '#74FFD5',
          '#FF7C74',
          '#74FF9B',
          '#FFE074',
          '#CF4B4B'
        ],
        data: data
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
              <ArrowTopRightOnSquareIcon className='h-5 w-5 flex-none text-primary' aria-hidden='true'/>
          </Link>}   
      </div>    
      <ReactECharts
        option={options}
        notMerge={true}
        style={{ width: '100%', height: '100%' }}
        lazyUpdate={true}
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
