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
import { parseDate} from '@/utils/utils';
import Search from '@/components/Search';
import Image from 'next/image';
import Chart from '@/components/Chart';
import Loading from '@/components/Loading';
import Footer from '@/components/Footer';
import DownloadList from '@/components/DownloadList';
import GithubStats from '@/components/GithubStats';
import Filter from '@/components/Filter';
import DatePicker from '@/components/DatePicker';
import { Suspense } from 'react';
import Link from 'next/link';

export const revalidate = 3600;

export async function generateMetadata({ params, searchParams }, parent) {
  const package_name = params.package_name;

  return {
    title: `ClickPy - Download analytics for ${package_name}`,
    description: `Analytics for the python package ${package_name}, powered by ClickHouse`,
  }
}


export default async function Dashboard({ params, searchParams }) {
  const version = searchParams.version;
  const country_code = searchParams.country_code;
  const file_type = searchParams.type;
  let min_date = parseDate(searchParams.min_date, null);
  let max_date = parseDate(searchParams.max_date, null);
  console.log(min_date)
  console.log(max_date)
  const package_name = params.package_name;
  const key = JSON.stringify({ ...searchParams });
  if (min_date == null || max_date == null) {
    const ranges = await getPackageDateRanges(package_name, version);
    min_date = version ? ranges.min_date : '2011-01-01';
    max_date = ranges.max_date;
  }

  const packageDetails = await getPackageDetails(package_name, version);
  return (
    <div>
      <header className='bg-neutral-800 shadow-lg border-b-2 border-neutral-725 sticky top-0 z-20 opacity-95 backdrop-filter backdrop-blur-xl bg-opacity-90 2xl:h-[82px]'>
        <div className='mx-auto flex flex-col 2xl:flex-row 2xl:items-center justify-between px-4 sm:px-8 xsm:px-6 lg:px-16 lg:w-full xl:w-11/12 lg:mb-0'>
          <div className='md:items-center flex flex-col md:flex-row gap-4 md:gap-8 md:h-[82px] pt-[26px] md:pt-0 ml-0 w-full'>
            <Link href='/' className='min-w-[96px]'>
              <Image
                className='w-24'
                src='/click_py.svg'
                alt='ClickPy by ClickHouse'
                width='96'
                height='32'
              />
            </Link>
            <div className='ml-2 md:mb-0 mb-4'>
              <Search package_name={package_name} />
            </div>
          </div>
          <div className='flex flex-col sm:flex-row sm:items-center gap-4 2xl:ml-4 mb-4 2xl:mt-4 -ml-[8px] md:ml-0'>
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
            
          </div> 
          <div className='hidden 2xl:flex grow width-20 max-w-[122px] md:mt-2 ml-4'>
              <p className='text-sm text-neutral-0'>
                Powered by &nbsp;
                <a
                  className='text-primary-300 hover:underline'
                  href='http://clickhouse.com/'
                  target='_blank'>
                  ClickHouse
                </a>
              </p>
              <Link href='https://github.com/ClickHouse/clickpy' target='_blank' className='w-32 ml-4'>
                <Image
                  className='w-8 h-8'
                  src='/github.svg'
                  alt='ClickPy Github'
                  width='32'
                  height='32'/>
              </Link>
          </div>
        </div>
      </header>
      <div className='relative isolate'>
        <div className='pt-12 w-11/12 lg:w-full xl:w-11/12 mx-auto lg:px-16'>
          <PackageDetails name={package_name} {...packageDetails[1][0]} />
        </div>
        {
          packageDetails[1][0]?.repo_name && (
            <div className='mt-4 md:mt-12 w-11/12 lg:w-full xl:w-11/12 mx-auto lg:px-16'>
              <Suspense key={key} fallback={<Loading height='208px'/>}>
                <GithubStats package_name={package_name} min_date={min_date} max_date={max_date}/>
              </Suspense>
            </div>
          )
        }
        <div className='mt-4 md:mt-12 w-11/12 xl:w-11/12 lg:w-full mx-auto md:grid md:grid-cols-4 lg:grid-cols-3 gap-6 lg:px-16'>
          <DownloadList
            package_name={package_name}
            version={version}
            min_date={min_date}
            max_date={max_date}
            country_code={country_code}
            type={file_type}
            className='md:col-span-2'
          />
          <div className='mt-4 md:mt-0 h-24 md:col-span-2 lg:col-span-1'>
            <Version
              current={version ? version : 'All'}
              latest={packageDetails[1].length > 0 ? packageDetails[1][0].max_version: null}
              link = {packageDetails[1].length > 0 ? packageDetails[0]: null}
            />
          </div>
        </div>

        <div className='mt-12 w-11/12 lg:w-full xl:w-11/12 mx-auto lg:px-16 lg:h-[480px] lg:grid lg:grid-cols-3 gap-6'>
          <div className='h-[480px] lg:col-span-2'>
            <p className='text-2xl font-bold mb-5'>Downloads over time</p>
            <Suspense key={key} fallback={<Loading />}>
              <Chart
                type='line'
                getData={getDownloadsOverTime}
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
        <div className='mt-24 w-11/12 lg:w-full xl:w-11/12 mx-auto lg:px-16'>
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
        <div className='mt-24 w-11/12 lg:w-full xl:w-11/12 mx-auto lg:px-16 h-[480px]'>
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
        <div className='mt-24 w-11/12 lg:w-full xl:w-11/12 mx-auto lg:px-16 h-[480px] lg:grid xl:grid-cols-3 gap-6 mb-32'>
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
      <div className='mb-8 w-10/12 flex justify-center mx-auto h-[640px] xl:h-full items-end'>
        <Footer/>
      </div>
    </div>
    
  );
}
