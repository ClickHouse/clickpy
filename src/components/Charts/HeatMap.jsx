'use client';
import React, { useRef, useState } from 'react';
import isEqual from 'lodash/isEqual';
import ReactECharts from 'echarts-for-react';
import styles from './styles.module.css';
import Loading from '../Loading';

export default function HeatMap({ data, title, subtitle, onClick }) {
  const chartRef = useRef();
  const [loading, setLoading] = useState(true);

  const xValues = data
    .map((p) => p.x)
    .filter(function (item, pos, ary) {
      return !pos || item != ary[pos - 1];
    });
  const yValues = data
    .map((p) => p.y)
    .sort()
    .filter(function (item, pos, ary) {
      return !pos || item != ary[pos - 1];
    });

  const select = (values) => {
    onClick([values.name, yValues[values.value[1]]]);
  };

  const values = data.reduce((vals, val) => {
    val.x in vals
      ? (vals[val.x][val.y] = Number(val.z))
      : (vals[val.x] = { [val.y]: Number(val.z) });
    return vals;
  }, {});
  const options = {
    grid: {
      left: 90,
      top: 0,
      right: 40,
      bottom: 50
    },
    xAxis: {
      type: 'category',
      offset: 15,
      data: xValues,
      splitArea: {
        show: true
      },
      axisLine: {
        onZero: false
      }
    },
    toolBox: {
      show: false
    },
    yAxis: {
      type: 'category',
      offset: 15,
      splitArea: {
        show: true
      },
      data: yValues,
      axisLine: {
        onZero: false
      }
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
      borderWidth: 0,
      formatter: (params) => {
        return `<div class='${styles.tooltip}'>
                      <span class='${styles.tooltiptext}'>${
          yValues[params.value[1]]
        } - ${xValues[params.value[0]]} - ${Number(
          params.value[2]
        ).toLocaleString('en-US')}</span>
                  </div>`;
      },
      extraCssText: 'visibility: hidden;padding:0px;',
      position: (point, params, dom, rect, size) => {
        const echartsInstance = chartRef.current.getEchartsInstance();
        const pos = echartsInstance.convertToPixel({ seriesIndex: 0 }, [
          params.value[0],
          params.value[1]
        ]);
        return [pos[0], pos[1] - size.contentSize[1] * 2];
      }
    },
    visualMap: {
      min: 0,
      max: Math.max(...data.map((p) => p.z)),
      calculable: true,
      orient: 'horizontal',
      color: [
        'rgba(252, 255, 116, 1)',
        'rgba(252, 255, 116, 0.8)',
        'rgba(252, 255, 116, 0.6)',
        'rgba(252, 255, 116, 0.4)',
        'rgba(252, 255, 116, 0.2)',
        '#262626'
      ],
      show: false
    },
    series: [
      {
        type: 'heatmap',
        data: xValues
          .map((x, xi) =>
            yValues.map((y, yi) => [xi, yi, y in values[x] ? values[x][y] : 0])
          )
          .flat(),
        label: {
          show: false
        },
        emphasis: {
          disabled: true
        },
        itemStyle: {
          borderWidth: 15,
          borderColor: '#262626'
        }
      }
    ],
    legend: null
  };

  const onChartReady = (echarts) => {
    setLoading(false);
  };

  return (
    <div className='rounded-lg bg-slate-850 cursor-pointer shadow-inner border border-slate-700 h-full justify-between flex flex-col hover:shadow-xl transition-all duration-300 ease-in-out'>
      <div className='px-6 py-4  flex-row flex justify-between'>
        {title}
        <p
          className={
            'transition-all duration-300 ease-in-out hover:shadow-xl text-neutral-500'
          }>
          {subtitle}
        </p>
      </div>

      <div className='relative justify-self-stretch h-full'>
        <ReactECharts
          ref={chartRef}
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
    </div>
  );
}
