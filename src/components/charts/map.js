'use client'
import ReactECharts from 'echarts-for-react'
import 'echarts-countries-js/echarts-countries-js/world'
export default function CountryMap ({ data, onClick }) {
    
    const scaledValues = data.map(p => {
        return {
            name: p.name,
            value: Math.sqrt(p.value),
            label: p.value
        }
    })
    const values = scaledValues.map(p => Number(p.value))
    const options = {
        backgroundColor: '#343431',
        
        tooltip: {
          trigger: 'item',
          textStyle: {
                color: '#FCFF74',
                fontWeight: 'bold',
                fontSize: 16,
                lineHeight: 24
            },
          backgroundColor: '#181818',
          borderWidth: 0,
          formatter: function (params) {
            if (params.data) {
              return params.name + ': ' + Number(params.data.label).toLocaleString("en-US");
            }
            return params.name + ': 0'
          }
        },
        visualMap: {
          min: Math.min(...values),
          max: Math.max(...values),  
          text: ['Max', 'Min'],
          realtime: false,
          calculable: false,
          color: ['#FBFF46','#EEEF40', '#FCFF74', '#FDFFA3','#FEFFBA','#F6F7FA'],
          left: 32,
        },

        series: [
          {
            name: 'Downloads',
            type: 'map',
            map: 'world',
            roam: true,
            height: '80%',
            label: {
              show: false,
            },
            itemStyle: {
              normal: {
                borderWidth: 0.5,
                borderColor: 'black'
              },
              emphasis: {
                label: { show: true },
                shadowOffsetX: 0,
                shadowOffsetY: 0,
                shadowBlur: 20,
                shadowColor: 'rgba(0, 0, 0, 0.3)'
              }
            },
            data: scaledValues
          }
        ]
    }

    const select = (params) => {
        console.log(params)
    }

    return <div className="rounded-lg bg-chart border-2 border-slate-500 h-full" >
        <ReactECharts option={options} style={{ width: "100%", height: "100%" }} lazyUpdate={false} onEvents={{'click': select}}/>
    </div>

}