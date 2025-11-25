import React from 'react';
import Image from 'next/image';
import { getDownloadSummary } from '@/utils/clickhouse';
import { formatNumber } from '@/utils/utils';
import Link from 'next/link';
import {
  ArrowTopRightOnSquareIcon,
} from '@heroicons/react/20/solid';
import CopyDropdown from './CopyDropdown';
import { getMetabaseLink } from '@/utils/metabase';

async function DownloadList({
  package_name,
  version,
  max_date,
  min_date,
  country_code,
  type,
  ...props
}) {
  const [link, data] = await getDownloadSummary(
    package_name,
    version,
    min_date,
    max_date,
    country_code,
    type
  );

  const metabaseLink = getMetabaseLink('getDownloadSummary', package_name);

  if (data.length === 0) {
    return null;
  }
  const { total, last_day, last_week, last_month } = data[0];
  return (
    <section {...props}>
         
      <div className='rounded-lg bg-slate-850 flex md:justify-between p-4 h-28 border border-slate-700'>

        <div className='flex items-center grow justify-between'>
          <div className='h-16 w-16 flex gap-4'>
            <Image
              className='h-16 w-16 min-w-[64px] min-h-16'
              src='/download.svg'
              alt='Download'
              width={16}
              height={16}
            />
            <h3 className='hidden lg:flex flex-col pt-1.5'>
              <span className='text-xl font-bold'>Downloads</span>
              <span className='text-slate-200'>by period</span>
            </h3>
          </div>
          <ul className='md:justify-items-end flex flex-row mr-4 gap-4'>
            <li className='xl:flex flex-col'>
              <span className='text-xl mr-2 font-bold'>{formatNumber(last_day)}</span>
              <span className='text-slate-200 text-center'>last day</span>
            </li>
            <li className='hidden lg:flex flex-col'>
              <span className='text-xl mr-2 font-bold'>{formatNumber(last_week)}</span>
              <span className='text-slate-200 text-center'>last week</span>
            </li>
            <li className='lg:flex flex-col'>
              <span className='text-xl mr-2 font-bold'>{formatNumber(last_month)}</span>
              <span className='text-slate-200 text-center'>last month</span>
            </li>
            <li className='flex flex-col'>
              <span className='text-xl font-bold'>{formatNumber(total)}</span>
              <span className='text-slate-200 md:text-center'>total</span>
            </li>
          </ul>
        </div>
       
        <div className='flex-row flex justify-end w-4 mt-[-10px] mr-[-10px] '>
          { metabaseLink && <CopyDropdown link={metabaseLink} />}

          { link && <Link href={link} target='_blank' className='w-5 ml-2'>
              <ArrowTopRightOnSquareIcon className='h-5 w-5 flex-none icon-hover' aria-hidden='true'/>
          </Link>} 
        </div>

      </div>
    </section>
  );
}

export default DownloadList;
