import React, { Suspense } from 'react'
import Charts from "./Charts"
import { getDownloadsOverTimeBySystem } from '@/utils/clickhouse'
import Loading from './Loading'

const options = { stack: false, fill: false }

async function DashboardSystemOverTime({ package_name, version, min_date, max_date, country_code }) {
  const data = await getDownloadsOverTimeBySystem(package_name, version, 'Day', min_date, max_date, country_code)
  return (
    <>
      <p className='text-2xl font-bold mb-5'>Downloads by system over time</p>
      <Suspense fallback={<Loading />}>
        <Charts type='multiline' data={data} options={options} />
      </Suspense>
    </>
  )
}
export default DashboardSystemOverTime
