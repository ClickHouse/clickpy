'use client';
import React, { useRef, useState } from 'react';
import isEqual from 'lodash/isEqual';
import ReactECharts from 'echarts-for-react';
import styles from './styles.module.css';
import { formatNumber, toValidStyleName } from '@/utils/utils';
import Loading from '../Loading';
import Link from 'next/link';
import {
  ArrowTopRightOnSquareIcon,
} from '@heroicons/react/20/solid';

export default function HorizontalBar({
  data,
  stack = false,
  onClick,
  link,
  header,
  show_icons,
  title
}) {
  const chartRef = useRef();
  const [loading, setLoading] = useState(true);
  const yValues = Array.from(new Set(data.map((p) => p.x))).reverse();
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
        data: new Array(yValues.length).fill(0),
      };
    }
    return accumulator;
  }, {});

  const select = (values) => {
    onClick && onClick(values.name);
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
          itemStyle: {
            borderRadius: [0, 4, 4, 0]
          },
          color: color
        };
  });
  const icons = {}
  data.forEach(p => {
    if (p.icon) {
      icons[[toValidStyleName(p.x)]] =  {
        height: 24,
        backgroundColor: {
          image: `/avatar?icon_url=${p.icon}`
        },
        borderRadius: 4,
        borderWidth: 1,
      }
    }
  })

  const options = {
    animation: false,
    title: {
      text: title || '',
      left: 'center',
      bottom: 0,
      textStyle: {
        color: '#666',
        fontSize: 14,
        fontWeight: 'normal'
      }
    },
    grid: {
      right: 50,
      top: 10,
      bottom: 35,
      containLabel: true,
      left:  show_icons ? -60: -40,
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
        margin: show_icons ? 100: 80,
        align: 'left',
        formatter: (value) => {
          return `{${toValidStyleName(value)}| } {value| ${value.length < 10 ? value.padEnd(10, ' ') : value.substring(0, 8) + '..'}}`;
        },
        rich: icons
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
      {
        header ? header : (
          <div className='px-2 pt-1 pb-0 flex-row flex justify-end'>
            { link && <Link href={link} target='_blank' className='w-4 ml-2'>
                <ArrowTopRightOnSquareIcon className='h-5 w-5 flex-none icon-hover'  aria-hidden='true'/>
            </Link>}
          </div>
        )
      }
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
