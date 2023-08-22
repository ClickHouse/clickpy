'use client'
import ReactECharts from 'echarts-for-react'

export default function Pie ({ data, onClick }) {

    const options = {
        grid: {
            left: 0,
            right: 0
        },
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

        },
        legend: {
          top: '5%',
          textStyle: {
            color: '#FFFFFFF',
            fontSize: 18
          },
          icon: 'circle',
          icon: 'circle',
          left: '24px',
          backgroundColor: '#626262',
          borderRadius: 5,
          borderWidth: 1,
          padding: 10,
        },
        series: [
          {
            name: 'Distribution types',
            type: 'pie',
            radius: ['50%', '70%'],
            avoidLabelOverlap: true,
            center: ['50%', '60%'],
            label: {
              show: false,
            },
            emphasis: {
              label: {
                show: false,
              }
            },
            labelLine: {
              show: true
            },
            z: 2,
            itemStyle: {
                shadowColor: '#181818',
                shadowOffsetY: -10,
                shadowOffsetX: -10,
                shadowBlur: 10
            },
            color: ['#FCFF74', '#FC74FF', '#74ACFF', '#74FFD5', '#74FF9B', '#FF7C74', '#CF4B4B'],
            data: data
          },
        
        ]
      }

      const select = (params) => {
        onClick && onClick(params.name)
      }

      return <div className="rounded-lg bg-chart border-2 border-slate-500 h-full" >
            <ReactECharts option={options} style={{ width: "100%", height: "100%" }} lazyUpdate={true} onEvents={{'click': select}}/>
      </div>

}