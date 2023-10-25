import React from 'react';
import Image from 'next/image';
import { getDownloadSummary } from '@/utils/clickhouse';
import { formatNumber } from '@/utils/utils';

async function DownloadList({
  package_name,
  version,
  max_date,
  min_date,
  country_code,
  type,
  ...props
}) {
  const data = await getDownloadSummary(
    package_name,
    version,
    min_date,
    max_date,
    country_code,
    type
  );
  if (data.length === 0) {
    return null;
  }
  const { total, last_day, last_week, last_month } = data[0];
  return (
    <div {...props}>
      <div className='rounded-lg bg-slate-850 flex items-center gap-8 md:justify-between p-4 h-24 border border-slate-700'>
        <div className='h-16 w-16 flex gap-4'>
          <Image
            className='h-16 w-16 min-w-[64px] min-h-16'
            src='/download.svg'
            alt='Download'
            width={16}
            height={16}
          />
          <div className='hidden 2xl:flex flex-col'>
            <p className='text-xl font-bold'>Downloads</p>
            <p className='text-slate-200'>by period</p>
          </div>
        </div>
        <div className='md:justify-items-end flex flex-row mr-4 gap-4'>
          <div className='hidden xl:block'>
            <p className='text-xl mr-2 font-bold'>{formatNumber(last_day)}</p>
            <p className='text-slate-200 text-center'>last day</p>
          </div>
          <div className='hidden lg:block'>
            <p className='text-xl mr-2 font-bold'>{formatNumber(last_week)}</p>
            <p className='text-slate-200 text-center'>last week</p>
          </div>
          <div className='hidden lg:block'>
            <p className='text-xl mr-2 font-bold'>{formatNumber(last_month)}</p>
            <p className='text-slate-200 text-center'>last month</p>
          </div>
          <div>
            <p className='text-xl mr-2 font-bold'>{formatNumber(total)}</p>
            <p className='text-slate-200 md:text-center'>total</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DownloadList;
