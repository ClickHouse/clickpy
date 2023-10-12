import Downloads from '@/components/downloads'
import Version from '@/components/version'
import Package from '@/components/package'
import ClientComponent from './component'
import { getPackageDetails, getDownloadSummary, getDownloadsOverTime, getPackageDateRanges, getTopVersions, getDownloadsOverTimeByPython, 
  getDownloadsOverTimeBySystem, getDownloadsByCountry, getFileTypesByInstaller } from '@/utils/clickhouse'
import Search from '@/components/search'
import Image from 'next/image'
import versionIcon from './icons/version.svg'
import countryIcon from './icons/country.svg'

export default async function Dashboard({params, searchParams}) {
  const version = searchParams.version
  const country_code = searchParams.country_code
  let min_date = searchParams.min_date
  let max_date = searchParams.max_date
  if (min_date == null || max_date == null) {
    const ranges = await getPackageDateRanges(params.package_name, version)
    min_date =  ranges.min_date
    max_date = ranges.max_date
}
  
const [
      packageDetails, 
      downloadSummary, 
      downloadsOverTime, 
      versions,
      downloadsOverTimeByPython,
      downloadsOverTimeBySystem,
      downloadsByCountry,
      fileTypesByInstaller,
      // percentileRanks,
    ] = await Promise.all([
      getPackageDetails(params.package_name, version),
      getDownloadSummary(params.package_name, version, min_date, max_date, country_code),
      getDownloadsOverTime(params.package_name, version,'Day', min_date, max_date, country_code),
      // getTopDistributionTypes(params.package_name, version, min_date, max_date, country_code),
      getTopVersions(params.package_name, version, min_date, max_date, country_code),
      getDownloadsOverTimeByPython(params.package_name, version,'Day', min_date, max_date, country_code),
      getDownloadsOverTimeBySystem(params.package_name, version,'Day', min_date, max_date, country_code),
      getDownloadsByCountry(params.package_name, version, min_date, max_date, country_code),
      getFileTypesByInstaller(params.package_name, version, min_date, max_date, country_code),
      // getPercentileRank(min_date, max_date, country_code)
])

return (
  <div className='xl:ml-24'>

    <div className='flex flex-col xl:flex-row bg-[#20201D] xl:justify-between xl:items-center pt-6 pb-6 border-b z-20 border-slate-800 fixed top-0 left-0 right-0'>
      <div className='ml-12 xl:ml-36'>
        <Search package_name={params.package_name}/>
      </div>
      <div className='flex growxl:justify-end flex-col items-start md:flex-row md:items-center gap-4 mr-12 ml-8 xl:ml-0 mt-4 xl:mt-0'>
          <ClientComponent type='filter' data={country_code} options={{name: 'country_code', icon: <Image alt='country code' src={countryIcon}/>}}/>
          <ClientComponent type='filter' data={version} options={{name: 'version', icon: <Image alt='version' src={versionIcon}/>}}/>
          <ClientComponent type='date_picker' data={[min_date, max_date]}/>
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
          { packageDetails.length > 0 &&
              <Package packageDetails={packageDetails[0]}/>
          }
          
          <div className='grid gap-4 lg:grid-cols-3 md:grid-cols-2 mt-14'>
              <div className='lg:col-span-2 h-24'>
                {
                  downloadSummary.length > 0 &&
                    <Downloads last_day={downloadSummary[0].last_day} last_week={downloadSummary[0].last_week}
                    last_month={downloadSummary[0].last_month} total={downloadSummary[0].total}/>
                }
              </div>
              <div className='col-span-1 h-24'>
                { packageDetails.length > 0 &&
                    <Version current={version ? version : 'All'} latest={packageDetails[0].max_version}/>
                }
              </div>
          </div>
      </div>
      <div className='mt-20 ml-10 mr-10 lg:h-[480px] lg:grid lg:grid-cols-3 gap-4'>
          <div className='h-[480px] lg:col-span-2'>
              <p className='text-2xl font-bold mb-5'>Downloads over time</p>
              <ClientComponent type={'line'} data={downloadsOverTime}/>
          </div>
          <div className='h-[480px] mt-32 lg:mt-0'>
              <p className='text-2xl font-bold mb-5'>Top versions</p>
              <ClientComponent type={'pie'} data={versions} options={ {filter_name: 'version'} }/>
          </div>
      </div>
      <div className='mt-32 ml-10 mr-10'>
        <div className='h-[480px]'>
              <p className='text-2xl font-bold mb-5'>Downloads by Python version over time</p>
              <ClientComponent type={'bar'} data={downloadsOverTimeByPython} options={{stack: true}}/>
        </div>
      </div>
      <div className='mt-32 ml-10 mr-10 h-[480px]'>
        <div className='h-[480px]'>
              <p className='text-2xl font-bold mb-5'>Downloads by system over time</p>
              <ClientComponent type={'multiline'} data={downloadsOverTimeBySystem} options={{stack: false, fill: false}}/>
        </div>
      </div>
      <div className='mt-32 ml-10 mr-10 h-[480px] lg:grid xl:grid-cols-3 gap-4 mb-32'>
          <div className='h-[480px] xl:col-span-2'>
                <p className='text-2xl font-bold mb-5'>Downloads by country</p>
                <ClientComponent type={'map'} data={downloadsByCountry}/>
          </div>
          <div className='h-[480px] xl:col-span-1 mt-32 xl:mt-0'>
                <p className='text-2xl font-bold mb-5'>File types by installer</p>
                <ClientComponent type={'radar'} data={fileTypesByInstaller}/>
            </div>
      </div>
    </div>
  </div>
)
}
