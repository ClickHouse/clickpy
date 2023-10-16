import React, { Suspense } from 'react'
import Charts from "./Charts"
import { getTopVersions } from '@/utils/clickhouse'
import Loading from './Loading'

const options = { filter_name: 'version' }

async function DashboardTopVersions(props) {
  const data = await getTopVersions(props)
  return (
    <>
      <p className='text-2xl font-bold mb-5'>Top versions</p>
      <Suspense fallback={<Loading />}>
        <Charts type="pie" options={options} data={data} />
      </Suspense>
    </>
  )
}

export default DashboardTopVersions
