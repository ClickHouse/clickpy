import Version from '@/components/Version'
import PackageDetails from '@/components/PackageDetails'
import {
  getPackageDetails, getPackageDateRanges,
  getDownloadsOverTimeBySystem,
} from '@/utils/clickhouse'
import Search from '@/components/search'
import Image from 'next/image'
import DashboardDownloadOverTime from '@/components/DashboardDownloadOverTime'
import DashboardDownloadList from '@/components/DashboardDownloadList'
import Filter from '@/components/Filter'
import DatePicker from '@/components/DatePicker'
import DashboardTopVersions from '@/components/DashboardTopVersions'
import DashboardDownloadsByCountry from '@/components/DashboardDownloadsByCountry'
import DashboardFileTypesByInstaller from '@/components/DashboardFileTypesByInstaller'
import DashboardDownloadsOverTimeByPython from '@/components/DashboardDownloadsOverTimeByPython'
import DashboardSystemOverTime from '@/components/DashboardSystemOverTime'



export default async function Dashboard({ params, searchParams }) {
  const version = searchParams.version
  const country_code = searchParams.country_code
  let min_date = searchParams.min_date
  let max_date = searchParams.max_date
  if (min_date == null || max_date == null) {
    const ranges = await getPackageDateRanges(params.package_name, version)
    min_date = ranges.min_date
    max_date = ranges.max_date
  }

  const [
    packageDetails,
    // downloadsOverTime,
    // versions,
    downloadsOverTimeBySystem,
    // percentileRanks,
  ] = await Promise.all([
    getPackageDetails(params.package_name, version),
    // getDownloadsOverTime(params.package_name, version,'Day', min_date, max_date, country_code),
    // getTopDistributionTypes(params.package_name, version, min_date, max_date, country_code),
    // getTopVersions(params.package_name, version, min_date, max_date, country_code),
    getDownloadsOverTimeBySystem(params.package_name, version, 'Day', min_date, max_date, country_code),
    // getPercentileRank(min_date, max_date, country_code)
  ])

  return (
    <div className='xl:ml-24'>

      <div className='flex flex-wrap bg-[#20201D] justify-between items-center pt-6 pb-6 border-b z-20 border-slate-800 fixed top-0 left-0 right-0'>
        <div className='ml-12 xl:ml-36'>
          <Search package_name={params.package_name} />
        </div>
        <div className='flex growxl:justify-end flex-col items-start md:flex-row md:items-center gap-4 mr-12 ml-8 xl:ml-0 mt-4 xl:mt-0'>
          <Filter value={country_code} icon={<Image alt='country code' src="/country.svg" width={16} height={16} />} name='country_code' />
          <Filter value={version} icon={<Image alt='version' src="/version.svg" width={16} height={16} />} name='version' />
          <DatePicker dates={[min_date, max_date]} />
          <div className='hidden xl:flex grow width-20 max-w-[80px]'>
            <p className='text-sm text-neutral-0'>
              Powered by &nbsp;
              <a className='text-primary-300 hover:underline' href='http://clickhouse.com/' target='_blank'>
                ClickHouse
              </a>
            </p>
          </div>
        </div>
      </div>

      <div className='top-20 relative isolate z-10'>
        <div className='ml-10 mt-10 mr-10 relative z-10'>
          {packageDetails.length > 0 &&
            <PackageDetails {...packageDetails[0]} />
          }

          <div className='flex flex-wrap gap-4 mt-14'>
            <DashboardDownloadList package_name={params.package_name} version={version} min_date={min_date} max_date={max_date} country_code={country_code} className='flex-1 h-24' />
            {packageDetails.length > 0 &&
              <div className='w-full md:w-1/2 lg:w-1/3 h-24'>
                <Version current={version ? version : 'All'} latest={packageDetails[0].max_version} />
              </div>
            }
          </div>
        </div>
        <div className='mt-20 ml-10 mr-10 lg:h-[480px] lg:grid lg:grid-cols-3 gap-4'>
          <div className='h-[480px] lg:col-span-2'>
            <DashboardDownloadOverTime package_name={params.package_name} version={version} min_date={min_date} max_date={max_date} country_code={country_code} />
          </div>
          <div className='h-[480px] mt-32 lg:mt-0'>
            <DashboardTopVersions package_name={params.package_name} version={version} min_date={min_date} max_date={max_date} country_code={country_code} />
          </div>
        </div>
        <div className='mt-32 ml-10 mr-10'>
          <div className='h-[480px]'>
            <DashboardDownloadsOverTimeByPython package_name={params.package_name} version={version} min_date={min_date} max_date={max_date} country_code={country_code} />
          </div>
        </div>
        <div className='mt-32 ml-10 mr-10 h-[480px]'>
          <div className='h-[480px]'>
            <DashboardSystemOverTime package_name={params.package_name} version={version} min_date={min_date} max_date={max_date} country_code={country_code} />
          </div>
        </div>
        <div className='mt-32 ml-10 mr-10 h-[480px] lg:grid xl:grid-cols-3 gap-4 mb-32'>
          <div className='h-[480px] xl:col-span-2'>
            <DashboardDownloadsByCountry package_name={params.package_name} version={version} min_date={min_date} max_date={max_date} country_code={country_code} />
          </div>
          <div className='h-[480px] xl:col-span-1 mt-32 xl:mt-0'>
            <DashboardFileTypesByInstaller package_name={params.package_name} version={version} min_date={min_date} max_date={max_date} country_code={country_code} />
          </div>
        </div>
      </div>
    </div>
  )
}
