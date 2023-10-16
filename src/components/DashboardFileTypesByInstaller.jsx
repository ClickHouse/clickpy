import React, { Suspense } from 'react'
import Charts from "./Charts"
import { getFileTypesByInstaller } from '@/utils/clickhouse'
import Loading from './Loading'

async function DashboardFileTypesByInstaller({ package_name, version, min_date, max_date, country_code }) {
  const data = await getFileTypesByInstaller(package_name, version, min_date, max_date, country_code)
  return (
    <>
      <p className='text-2xl font-bold mb-5'>File types by installer</p>
      <Suspense fallback={<Loading />}>
        <Charts type='radar' data={data} />
      </Suspense>

    </>
  )
}

export default DashboardFileTypesByInstaller
