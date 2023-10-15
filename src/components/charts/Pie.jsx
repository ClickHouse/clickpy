'use client'
import ReactECharts from 'echarts-for-react'
import { chartLoadingOption, onChartReady } from '@/utils/chartsUtils'

export default function Pie({ data, onClick }) {
  const options = {
    animation: false,
    grid: {
      left: 0,
      right: 0,
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
    legend: {
      bottom: '5%',
      textStyle: {
        color: '#FFFFFFF',
        fontSize: 18,
      },
      icon: 'circle',
      icon: 'circle',
      left: '24px',
      backgroundColor: '#3F3F3F',
      borderRadius: 5,
      borderWidth: 1,
      borderColor: '#626262',
      padding: 10,
    },
    series: [
      {
        name: 'Distribution types',
        type: 'pie',
        radius: ['50%', '70%'],
        avoidLabelOverlap: true,
        center: ['50%', '40%'],
        label: {
          show: false,
        },
        emphasis: {
          label: {
            show: false,
          },
        },
        labelLine: {
          show: true,
        },
        z: 2,
        itemStyle: {

        },
        color: ['#FCFF74', '#FC74FF', '#74ACFF', '#74FFD5', '#FF7C74', '#74FF9B', '#FFE074', '#CF4B4B'],
        data: data,
      },
    ],
  }

  const select = (params) => {
    onClick && onClick(params.name)
  }

  return (
    <div className='rounded-lg bg-slate-850 border border-slate-700 h-full'>
      <ReactECharts
        option={options}
        notMerge={true}
        style={{ width: '100%', height: '100%' }}
        lazyUpdate={true}
        showLoading={true}
        loadingOption={chartLoadingOption}
        onChartReady={onChartReady}
        onEvents={{ click: select }}
      />
    </div>
  )
}
