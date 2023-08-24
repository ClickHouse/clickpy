"use client";
import React, { useRef, useState } from "react";
import ReactECharts from "echarts-for-react";
import { ArrowTopRightOnSquareIcon } from "@heroicons/react/20/solid";
import { useRouter } from 'next/navigation'
import Link from "next/link";

export default function SparkLine({ name, data, total, link }) {
  const chartRef = useRef();
  const router = useRouter();
  const [selected, setSelected] = useState(false);
  const formatQuantity = (value) => {
    if (value > 1000) {
      return `${value / 1000}B`;
    }
    return `${value}M`;
  };

  const onMouseOver = () => {
    const echartsInstance = chartRef.current.getEchartsInstance();
    const newOptions = echartsInstance.getOption();
    newOptions.series[0].lineStyle.opacity = 1;
    newOptions.series[0].lineStyle.shadowColor = "#FCFF74";
    newOptions.series[0].lineStyle.shadowOffsetX = 0;
    newOptions.series[0].lineStyle.shadowOffsetY = 0;
    newOptions.series[0].lineStyle.shadowBlur = 0;
    newOptions.series[0].areaStyle = {
      color: {
        type: "linear",
        x: 0,
        y: 0,
        x2: 0,
        y2: 0.65,
        colorStops: [
          {
            offset: 0,
            color: "#FCFF74",
          },
          {
            offset: 1,
            color: "#343431",
          },
        ],
      },
      opacity: 0.1,
    };
    echartsInstance.setOption(newOptions);
    setSelected(true);
  };

  const options = {
    animation: false,
    grid: {
      left: "-10%",
      right: "-10%",
      top: 0,
      bottom: 0,
    },
    xAxis: {
      type: "category",
      data: data.map((p) => p.x),
      axisLabel: false,
      axisLine: false,
    },
    yAxis: {
      type: "value",
      axisLabel: false,
      axisLine: false,
      axisTick: {
        show: false,
      },
      splitLine: {
        show: false,
      },
    },
    series: [
      {
        data: data.map((p) => p.y),
        type: "line",
        smooth: true,
        symbol: "none",
        areaStyle: null,
        lineStyle: {
          color: "#FCFF74",
          width: 4,
          opacity: 0.4,
          shadowColor: "#000000",
          shadowOffsetX: 0,
          shadowOffsetY: 7,
          shadowBlur: 10,
        },
      },
    ],
    tooltip: null,
  };

  const onMouseOut = () => {
    const echartsInstance = chartRef.current.getEchartsInstance();
    echartsInstance.setOption(options);
    setSelected(false);
  };

  const onClick = () => {
    router.push(link)
  }

  return (
    <div
      className="cursor-pointer rounded-lg bg-chart border border-slate-700 h-full justify-between flex flex-col"
      onMouseMove={onMouseOver}
      onMouseOut={onMouseOut}
      onClick={onClick}
    >
      <p
        className={`font-inter xl:text-xl lg:text-l text-right ml-2 mr-2 mt-3 ${
          selected ? "text-white" : "text-slate-500"
        }`}
      >
        {formatQuantity(total)} Downloads
      </p>

      <div className="justify-self-stretch">
        <ReactECharts
          ref={chartRef}
          option={options}
          style={{ width: "100%", height: "100%" }}
          lazyUpdate={false}
        />
      </div>
      <div className="mb-3 ml-4 mr-2 flex justify-between text-left">
        <p
          className={`font-inter font-bold lg:text-l xl:text-2xl ${
            selected ? "text-white" : "text-slate-500"
          }`}
        >
          {name}
        </p>
        <Link href={link}>
          <ArrowTopRightOnSquareIcon
            className={`h-6 w-6 ${selected ? "fill-white" : "fill-slate-500"}`}
            aria-hidden="true"
          />
        </Link>
      </div>
    </div>
  );
}
