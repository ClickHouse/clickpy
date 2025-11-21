'use client'
import React, { useRef } from 'react'
import dynamic from 'next/dynamic'

// ECharts depends on browser APIs (window/document), so it breaks during Next.js SSR.
// We load it dynamically on the client only.
const ReactECharts = dynamic(() => import('echarts-for-react'), {
  ssr: false,
})

export default function TreeMap ({data, onSelect}) {



}