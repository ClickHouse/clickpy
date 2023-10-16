import React, { Suspense } from 'react'
import Charts from "./Charts"
import { getDownloadsByCountry } from '@/utils/clickhouse'
import Loading from './Loading'

const options = { filter_name: 'version' }

async function DashboardDownloadsByCountry({ package_name, version, min_date, max_date, country_code }) {
  const data = await getDownloadsByCountry(package_name, version, min_date, max_date, country_code)
  return (
    <>
      <p className='text-2xl font-bold mb-5'>Downloads by country</p>
      <Suspense fallback={<Loading />}>
        <Charts type={'map'} data={data} />
      </Suspense>
    </>
  )
}

export default DashboardDownloadsByCountry
