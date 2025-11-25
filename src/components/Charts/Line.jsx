'use client';
import React, { useRef, useState } from 'react';
import isEqual from 'lodash/isEqual';
import styles from './styles.module.css';
import Loading from '../Loading';
import Link from 'next/link';
import {
  ArrowTopRightOnSquareIcon,
} from '@heroicons/react/20/solid';
import CopyDropdown from '../CopyDropdown';
import dynamic from 'next/dynamic'

// ECharts depends on browser APIs (window/document), so it breaks during Next.js SSR.
// We load it dynamically on the client only.
const ReactECharts = dynamic(() => import('echarts-for-react'), {
  ssr: false,
})

export default function Line({ data, onSelect, onClear, link, metabaseLink }) {
  const [loading, setLoading] = useState(true);

  const chartRef = useRef();
  const xAxis = data.map((p) => p.x);
  const onMouseOver = () => {
    const echartsInstance = chartRef.current?.getEchartsInstance();
    if (!echartsInstance) return;
    const newOptions = echartsInstance.getOption();
    newOptions.series[0].lineStyle.opacity = 1;
    newOptions.series[0].lineStyle.shadowColor = '#FAFF69';
    newOptions.series[0].lineStyle.shadowOffsetX = 0;
    newOptions.series[0].lineStyle.shadowOffsetY = 0;
    newOptions.series[0].lineStyle.shadowBlur = 0;
    newOptions.series[0].areaStyle = {
      color: {
        type: 'linear',
        x: 0,
        y: 0,
        x2: 0,
        y2: 0.65,
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
    echartsInstance.dispatchAction({
      type: 'takeGlobalCursor',
      key: 'brush',
      brushOption: {
        brushType: 'lineX'
      }
    });
  };

  const options = {
    animation: false,
    grid: {
      left: '80px',
      right: '24px',
      bottom: '36px'
    },
    xAxis: {
      show: true,
      type: 'category',
      data: xAxis,
      nameLocation: 'middle',
      min: 0,
      max: xAxis.length - 1
    },
    yAxis: {
      type: 'value',
      splitLine: {
        show: true,
        lineStyle: {
          color: '#808691',
          opacity: 0.3
        }
      }
    },
    series: [
      {
        data: data.map((p) => p.y),
        type: 'line',
        smooth: true,
        showSymbol: false,
        areaStyle: null,
        lineStyle: {
          color: '#FAFF69',
          width: 1.5
        }
      }
    ],
    tooltip: {
      trigger: 'axis',
      textStyle: {
        color: '#FAFF69',
        fontWeight: 'bold',
        fontSize: 16,
        lineHeight: 24
      },
      backgroundColor: 'transparent',
      borderWidth: 0,
      formatter: (params) => {
        return `<div class='${styles.tooltip}'>
                    <span class='${styles.tooltiptext}'>${params[0].axisValue}: ${Number(
          params[0].value
        ).toLocaleString('en-US')}</span>
                </div>`;
      },
      extraCssText: 'visibility: hidden;padding:0px;',
      position: (point, params, dom, rect, size) => {
        const echartsInstance = chartRef.current?.getEchartsInstance();
        if (!echartsInstance) return;
        const pos = echartsInstance.convertToPixel({ seriesIndex: 0 }, [
          params[0].axisValue,
          params[0].value
        ]);
        return [pos[0], pos[1] - size.contentSize[1] * 2];
      }
    },
    brush: {
      toolbox: ['lineX'],
      brushType: 'lineX',
      brushMode: 'single',
      transformable: false
    }
  };

  const onDoubleClick = () => {
    onClear && onClear();
  }

  const onMouseOut = () => {
    const echartsInstance = chartRef.current?.getEchartsInstance();
    if (!echartsInstance) return;
    echartsInstance.setOption(options);
  };

  const onBrushEnd = (params) => {
    if (params.areas.length > 0) {
      const echartsInstance = chartRef.current?.getEchartsInstance();
      if (!echartsInstance) return;
      let start = echartsInstance.convertFromPixel(
        { xAxisIndex: 0 },
        params.areas[0].range[0]
      );
      let end = echartsInstance.convertFromPixel(
        { xAxisIndex: 0 },
        params.areas[0].range[1]
      );
      start = start > 0 ? start : 0;
      end = end < xAxis.length ? end : xAxis.length - 1;
      onSelect &&
        xAxis[start] &&
        xAxis[end] &&
        onSelect(xAxis[start], xAxis[end]);
    }
  };

  const onChartReady = (echarts) => {
    setLoading(false);
  };

  return (
    <div
      className='relative rounded-lg bg-slate-850 border border-slate-700 h-full justify-between flex flex-col'
      onMouseOver={onMouseOver}
      onMouseOut={onMouseOut}
      onDoubleClickCapture={onDoubleClick}>
      <div className='px-[8px] pt-[8px] flex-row flex justify-end'>
        { metabaseLink && <CopyDropdown link={metabaseLink} />}
        { link && <Link href={link} target='_blank' className='w-5 ml-2 icon-hover'>
            <ArrowTopRightOnSquareIcon className='h-5 w-5 flex-none icon-hover' aria-hidden='true'/>
        </Link>}   
      </div>    

      <ReactECharts
        ref={chartRef}
        option={options}
        style={{ width: '100%', height: '100%' }}
        lazyUpdate
        onChartReady={onChartReady}
        onEvents={{
          brushEnd: onBrushEnd
        }}
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
