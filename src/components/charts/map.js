'use client';
import ReactECharts from 'echarts-for-react';
import 'echarts-countries-js/echarts-countries-js/world';
export default function CountryMap({ data, selected, onClick }) {

  const scaledValues = data.map((p) => {
    return  {
      name: p.name,
      value: Math.sqrt(p.value),
      label: p.value,
      code: p.country_code,
      selected: p.country_code == selected,
    }
  })

  const values = scaledValues.map((p) => Number(p.value));
  const options = {
    colorBy: selected == null ? 'series': 'data',
    color: selected ? ['#2F2F2F']: ['#FAFF69', '#DDE26B', '#B2B661', '#8A8C5A', '#51523B', '#2F2F2F'],
    animation: false,
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
      formatter: function (params) {
        if (params.data) {
          return (
            params.name +
            ': ' +
            Number(params.data.label).toLocaleString('en-US')
          );
        }
        return params.name + ': 0';
      },
    },
    series: [
      {
        name: 'Downloads',
        type: 'map',
        map: 'world',
        roam: false,
        height: '80%',
        label: {
          show: false,
        },
        select: {
            disabled: false,
            itemStyle: {
              areaColor: '#FFFFFF'
            },
            label: { show: false },
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
        },
      },
    ],
  }

  if (values.length > 0) {
    options['visualMap'] = {
      min: Math.min(...values),
      max: Math.max(...values),
      text: ['Max', 'Min'],
      realtime: false,
      calculable: false,  
      color: ['#FAFF69', '#DDE26B', '#B2B661', '#8A8C5A', '#51523B', '#2F2F2F'],
      left: 32,
    }
  }

  const select = (params) => {
    onClick && params.data && onClick(params.data.code);
  }

  return (
    <div className='rounded-lg bg-slate-850 border border-slate-700 h-full'>
      <ReactECharts
        option={options}
        style={{ width: '100%', height: '100%' }}
        lazyUpdate={false}
        onEvents={{ click: select }}
      />
    </div>
  )
}
