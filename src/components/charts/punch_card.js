'use client'
import React, { useRef } from 'react'
import ReactECharts from 'echarts-for-react'

export default function PunchCard({ data,  title, subtitle}) {
    const xValues = data.map(p => p.x).filter(function(item, pos, ary) {
        return !pos || item != ary[pos - 1]
    }).reverse()
    //sort according to total y-values
    const yValues = data.reduce((acc, curr) => {
        const { y, z } = curr
        // Check if the key already exists in the accumulator
        const existingObject = acc.find(item => item.y === y)
        if (existingObject) {
            existingObject.z += z
        } else {
            acc.push({ y, z })
        }
        return acc
    }, []).sort((a, b) => b.z - a.z).map(p => p.y).reverse()

    const values = data.reduce((vals, val) => { val.x in vals ? vals[val.x][val.y] = Number(val.z) : vals[val.x] = {[val.y]: Number(val.z)}; return vals; }, {})
    // unique series - we assume they are shorted by series
    const seriesNames = data.map(p => p.name).filter(function(item, pos, ary) {
        return !pos || item != ary[pos - 1]
    })
    const maxSymbolSize = 30
    const maxValue = Math.max(...data.map(p => Number(p.z)))
    console.log(`Max value: ${maxValue}`)

    const options = {
        animation: false,
        grid: {
            left: 120,
            right: 50,
            top: 10,
            bottom: 35
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
        xAxis: {
            type: 'category',
            data: xValues,
            boundaryGap: false,
            splitLine: {
            show: true,
            lineStyle: {
                color: '#808691',
                opacity: 0.3,
            },
            },
            axisLine: {
            show: false
            }
        },
        legend: {
        show: false
        },
        yAxis: {
            type: 'category',
            data: yValues,
            axisLine: {
                show: false
            },
            splitLine: {
                show: true,
                lineStyle: {
                    color: '#808691',
                    opacity: 0.3,
                },
            }
        },
        series: [
            {
            type: 'scatter',
            color: 'rgba(252, 255, 116, 1)',
            symbolSize: function (val) {
                console.log(Number(val[2]))
                console.log((Number(val[2])/maxValue)*maxSymbolSize)
                return (Number(val[2])/maxValue)*maxSymbolSize;
            },
            data: xValues.map((x, xi) => yValues.map((y, yi) => [xi,yi, y in values[x] ? values[x][y] : 0])).flat(),
            animationDelay: function (idx) {
                return idx * 5;
            }
            }
        ]
  }


  return (
    <div
      className='rounded-lg bg-slate-850 border border-slate-700 rounded-l h-full justify-between flex flex-col'
    >
      {
        title && (
          <div className='px-6 pt-4 pb-0 flex-row flex justify-between'>
                {title}
              <p className={'transition-all duration-300 ease-in-out hover:shadow-xl text-neutral-500'}>
                  {subtitle}
              </p>
          </div>
        )
      }
      <ReactECharts
        option={options}
        style={{ width: '100%', height: '100%' }}
      />
    </div>
  );
}
