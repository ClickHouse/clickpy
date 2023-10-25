import Version from '@/components/Version';
import PackageDetails from '@/components/PackageDetails';
import {
  getPackageDetails,
  getPackageDateRanges,
  getDownloadsOverTime,
  getTopVersions,
  getDownloadsOverTimeByPython,
  getDownloadsOverTimeBySystem,
  getDownloadsByCountry,
  getFileTypesByInstaller
} from '@/utils/clickhouse';
import Search from '@/components/Search';
import Image from 'next/image';
import Chart from '@/components/Chart';
import Loading from '@/components/Loading';
import DownloadList from '@/components/DownloadList';
import Filter from '@/components/Filter';
import DatePicker from '@/components/DatePicker';
import { Suspense } from 'react';
import Link from 'next/link';

export default async function Dashboard({ params, searchParams }) {
  const version = searchParams.version;
  const country_code = searchParams.country_code;
  const file_type = searchParams.type;
  let min_date = searchParams.min_date;
  let max_date = searchParams.max_date;
  const package_name = params.package_name;
  const key = JSON.stringify({ ...searchParams });
  if (min_date == null || max_date == null) {
    const ranges = await getPackageDateRanges(package_name, version);
    min_date = ranges.min_date;
    max_date = ranges.max_date;
  }
  const packageDetails = await getPackageDetails(package_name, version);
  return (
    <div>
      <header className='bg-neutral-800 shadow-lg border-b-2 border-neutral-725 sticky top-0 z-20 opacity-95 backdrop-filter backdrop-blur-xl bg-opacity-90 lg:h-[82px]'>
        <div className='mx-auto flex flex-col lg:flex-row md:items-center justify-between py-2 lg:px-16 w-11/12 lg:w-full xl:w-11/12'>
          <div className='md:items-center flex flex-col md:flex-row gap-8 mt-1.5 w-full'>
            <Link href='/'>
              <Image
                className='w-24'
                src='/click_py.svg'
                alt='ClickPy by ClickHouse'
                width='96'
                height='32'
              />
            </Link>
            <div className='ml-4 md:ml-0'>
              <Search package_name={package_name} />
            </div>
          </div>
          <div className='flex growxl:justify-end flex-col items-start md:flex-row lg:items-center gap-4 lg:ml-8 xl:ml-0 my-4 md:mt-2 md:mb-0 '>
            <Filter
              value={country_code}
              icon={
                <Image
                  alt='country code'
                  src='/country.svg'
                  width={16}
                  height={16}
                />
              }
              name='country_code'
            />
            <Filter
              value={version}
              icon={
                <Image
                  alt='version'
                  src='/version.svg'
                  width={16}
                  height={16}
                />
              }
              name='version'
            />
            <Filter
              value={file_type}
              icon={
                <Image alt='type' src='/file_type.svg' width={16} height={16} />
              }
              name='type'
            />
            <DatePicker dates={[min_date, max_date]} />
            <div className='hidden xl:flex grow width-20 max-w-[80px]'>
              <p className='text-sm text-neutral-0'>
                Powered by &nbsp;
                <a
                  className='text-primary-300 hover:underline'
                  href='http://clickhouse.com/'
                  target='_blank'>
                  ClickHouse
                </a>
              </p>
            </div>
          </div>
        </div>
      </header>
      <div className='relative isolate'>
        <div className='pt-16 w-11/12 lg:w-full xl:w-11/12 mx-auto lg:px-16 relative'>
          {packageDetails.length > 0 && (
            <PackageDetails {...packageDetails[0]} />
          )}
          <div className='mt-8 md:mt-20 w-full mx-auto md:grid md:grid-cols-4 lg:grid-cols-3 gap-6'>
            <DownloadList
              package_name={package_name}
              version={version}
              min_date={min_date}
              max_date={max_date}
              country_code={country_code}
              type={file_type}
              className='md:col-span-2'
            />
            {packageDetails.length > 0 && (
              <div className='mt-4 md:mt-0 h-24 md:col-span-2 lg:col-span-1'>
                <Version
                  current={version ? version : 'All'}
                  latest={packageDetails[0].max_version}
                />
              </div>
            )}
          </div>
        </div>
        <div className='mt-20 w-11/12 lg:w-full xl:w-11/12 mx-auto lg:px-16 lg:h-[480px] lg:grid lg:grid-cols-3 gap-6'>
          <div className='h-[480px] lg:col-span-2'>
            <p className='text-2xl font-bold mb-5'>Downloads over time</p>
            <Suspense key={key} fallback={<Loading />}>
              <Chart
                type='line'
                getData={getDownloadsOverTime}
                params={{
                  period: 'Day',
                  package_name: package_name,
                  version: version,
                  min_date: min_date,
                  max_date: max_date,
                  country_code: country_code,
                  type: file_type
                }}
              />
            </Suspense>
          </div>
          <div className='h-[480px] mt-32 lg:mt-0'>
            <p className='text-2xl font-bold mb-5'>Top versions</p>
            <Suspense key={key} fallback={<Loading />}>
              <Chart
                type='pie'
                getData={getTopVersions}
                params={{
                  package_name: package_name,
                  version: version,
                  min_date: min_date,
                  max_date: max_date,
                  country_code: country_code,
                  type: file_type
                }}
                options={{ filter_name: 'version' }}
              />
            </Suspense>
          </div>
        </div>
        <div className='mt-32 w-11/12 lg:w-full xl:w-11/12 mx-auto lg:px-16'>
          <div className='h-[480px]'>
            <p className='text-2xl font-bold mb-5'>
              Downloads by Python version over time
            </p>
            <Suspense key={key} fallback={<Loading />}>
              <Chart
                type='bar'
                options={{ stack: true }}
                getData={getDownloadsOverTimeByPython}
                params={{
                  period: 'Day',
                  package_name: package_name,
                  version: version,
                  min_date: min_date,
                  max_date: max_date,
                  country_code: country_code,
                  type: file_type
                }}
              />
            </Suspense>
          </div>
        </div>
        <div className='mt-32 w-11/12 lg:w-full xl:w-11/12 mx-auto lg:px-16 h-[480px]'>
          <div className='h-[480px]'>
            <p className='text-2xl font-bold mb-5'>
              Downloads by system over time
            </p>
            <Suspense key={key} fallback={<Loading />}>
              <Chart
                type='multiline'
                options={{ stack: false, fill: false }}
                getData={getDownloadsOverTimeBySystem}
                params={{
                  period: 'Day',
                  package_name: package_name,
                  version: version,
                  min_date: min_date,
                  max_date: max_date,
                  country_code: country_code,
                  type: file_type
                }}
              />
            </Suspense>
          </div>
        </div>
        <div className='mt-32 w-11/12 lg:w-full xl:w-11/12 mx-auto lg:px-16 h-[480px] lg:grid xl:grid-cols-3 gap-6 mb-32'>
          <div className='h-[480px] xl:col-span-2'>
            <p className='text-2xl font-bold mb-5'>Downloads by country</p>
            <Suspense key={key} fallback={<Loading />}>
              <Chart
                type='map'
                options={{ filter_name: 'version' }}
                getData={getDownloadsByCountry}
                params={{
                  package_name: package_name,
                  version: version,
                  min_date: min_date,
                  max_date: max_date,
                  country_code: country_code,
                  type: file_type
                }}
              />
            </Suspense>
          </div>
          <div className='h-[480px] xl:col-span-1 mt-32 xl:mt-0'>
            <p className='text-2xl font-bold mb-5'>File types by installer</p>
            <Suspense key={key} fallback={<Loading />}>
              <Chart
                type='radar'
                options={{ column: 'type' }}
                getData={getFileTypesByInstaller}
                params={{
                  package_name: package_name,
                  version: version,
                  min_date: min_date,
                  max_date: max_date,
                  country_code: country_code,
                  type: file_type
                }}
              />
            </Suspense>
          </div>
        </div>
      </div>
    </div>
  );
}
