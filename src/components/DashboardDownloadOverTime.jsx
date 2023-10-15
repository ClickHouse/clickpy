import React, { Suspense } from 'react';
import { getDownloadsOverTime } from '@/utils/clickhouse';
import Charts from '@/components/Charts';
import Loading from './Loading';

async function DashboardDownloadByTime(props) {
  const data = await getDownloadsOverTime({ period: "Day", ...props })
  return (
    <>
      <p className='text-2xl font-bold mb-5'>Downloads over time</p>
      <Suspense fallback={<Loading />}>
        <Charts type="line" data={data} />
      </Suspense>
    </>
  );
}

export default DashboardDownloadByTime;
