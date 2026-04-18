// src/components/Charts/ReactEChartsNoSSR.js
'use client';
import dynamic from 'next/dynamic';

export default dynamic(() => import('echarts-for-react'), { ssr: false });
