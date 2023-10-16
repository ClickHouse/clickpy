import React, { Suspense } from 'react';
import Charts from "./Charts"
import { getDownloadsOverTimeByPython } from '@/utils/clickhouse';
import Loading from './Loading';

const options = { stack: true }

async function DashboardDownloadsOverTimeByPython({ package_name, version, min_date, max_date, country_code }) {
  const data = await getDownloadsOverTimeByPython(package_name, version, 'Day', min_date, max_date, country_code)
  return (
    <>
      <p className='text-2xl font-bold mb-5'>Downloads by Python version over time</p>
      <Suspense fallback={<Loading />}>
        <Charts type='bar' data={data} options={options} />
      </Suspense>
    </>
  );
}

export default DashboardDownloadsOverTimeByPython;
