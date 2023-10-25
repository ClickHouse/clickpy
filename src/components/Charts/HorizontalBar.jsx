'use client';
import React, { useRef, useState } from 'react';
import isEqual from 'lodash/isEqual';
import ReactECharts from 'echarts-for-react';
import styles from './styles.module.css';
import { formatNumber } from '@/utils/utils';
import Loading from '../Loading';

export default function HorizontalBar({
  data,
  title,
  subtitle,
  stack = false,
  onClick
}) {
  const chartRef = useRef();
  const [loading, setLoading] = useState(true);
  const yValues = Array.from(new Set(data.map((p) => p.x)));
  // unique series - we assume they are shorted by series
  const seriesNames = data
    .map((p) => p.name)
    .filter(function (item, pos, ary) {
      return !pos || item != ary[pos - 1];
    });
  const values = data.reduce((accumulator, val) => {
    if (!(val.name in accumulator)) {
      accumulator[val.name] = {
        name: val.name,
        data: new Array(yValues.length).fill(0)
      };
    }
    return accumulator;
  }, {});

  const select = (values) => {
    onClick(values.name);
  };

  data.forEach((p) => (values[p.name].data[yValues.indexOf(p.x)] = p.y));
  const colors =
    seriesNames.length === 1
      ? ['rgba(252, 255, 116, 1.0)']
      : [
          'rgba(252, 255, 116, 0.2)',
          'rgba(252, 255, 116, 0.6)',
          'rgba(252, 255, 116, 1.0)'
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
          stack: 'total'
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
      left: 80,
      right: 50,
      top: 10,
      bottom: 35
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
      // TODO: make this work for multi series and stacked
      formatter: (params) => {
        return `<div class='${styles.tooltip}'>
                    <span class='${styles.tooltiptext}'>${
          params.name
        } - ${Number(params.value).toLocaleString('en-US')}</span>
                </div>`;
      },
      extraCssText: 'visibility: hidden;padding:0px;',
      position: (point, params, dom, rect, size) => {
        return [point[0], point[1] - rect.height];
      }
    },
    xAxis: {
      splitLine: {
        show: true,
        lineStyle: {
          color: '#808691',
          opacity: 0.3
        }
      },
      axisLabel: {
        formatter: (value, index) => {
          return formatNumber(value);
        }
      }
    },
    legend: {
      show: false
    },
    yAxis: {
      show: true,
      type: 'category',
      data: yValues,
      axisLabel: {
        show: true
      }
    },
    series: seriesNames.map((s) => series.find((c) => c.name === s))
  };

  const onMouseOver = () => {
    const echartsInstance = chartRef.current.getEchartsInstance();
  };

  const onChartReady = (echarts) => {
    setLoading(false);
  };

  return (
    <div
      className='relative rounded-lg bg-slate-850 border border-slate-700 h-full justify-between flex flex-col'
      onMouseOver={onMouseOver}>
      {title && (
        <div className='px-6 pt-4 pb-0 flex-row flex justify-between items-end'>
          {title}
          <p
            className={
              'transition-all duration-300 ease-in-out hover:shadow-xl text-neutral-500 text-sm'
            }>
            {subtitle}
          </p>
        </div>
      )}
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
  );
}
