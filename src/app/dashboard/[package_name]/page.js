import Downloads from '@/components/downloads'
import Version from '@/components/version'
import Package from '@/components/package'
import ClientComponent from './component'
import { getPercentileRank, getPackageDetails, getDownloadSummary, getDownloadsOverTime, getPackageDateRanges, getTopVersions, getDownloadsOverTimeByPython, 
  getDownloadsOverTimeBySystem, getDownloadsByCountry, getFileTypesByInstaller } from '@/utils/clickhouse'


export default async function Dashboard({params, searchParams}) {
  const version = searchParams.version
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
      percentileRanks,
    ] = await Promise.all([
      getPackageDetails(params.package_name, version),
      getDownloadSummary(params.package_name, version, min_date, max_date),
      getDownloadsOverTime(params.package_name, version,'Day', min_date, max_date),
      // getTopDistributionTypes(params.package_name, version, min_date, max_date),
      getTopVersions(params.package_name, version, min_date, max_date),
      getDownloadsOverTimeByPython(params.package_name, version,'Day', min_date, max_date),
      getDownloadsOverTimeBySystem(params.package_name, version,'Day', min_date, max_date),
      getDownloadsByCountry(params.package_name, version, min_date, max_date),
      getFileTypesByInstaller(params.package_name, version, min_date, max_date),
      getPercentileRank(min_date, max_date)
])

return (
  <div className='xl:ml-24'>
    <div className='ml-10 mt-10 mr-10'>
        { packageDetails.length > 0 &&
            <Package packageDetails={packageDetails[0]}/>
        }
        <div className='flex justify-end items-center mt-4'>
          <ClientComponent type='filter' data={version} options={{label: 'version'}}/>
          <div className='ml-4'>
            <ClientComponent type='date_picker' data={[min_date, max_date]}/>
          </div>
        </div>
        
        <div className='grid gap-4 lg:grid-cols-3 md:grid-cols-2 mt-14'>
            <div className='lg:col-span-2 h-24'>
              {
                downloadSummary.length > 0 &&
                  <Downloads last_day={downloadSummary[0].last_day} last_week={downloadSummary[0].last_week}
                  last_month={downloadSummary[0].last_month} total={downloadSummary[0].total}/>
              }
            </div>
            <div className='col-span-1 h-24 '>
              { packageDetails.length > 0 &&
                  <Version current={version ? version : 'All'} latest={packageDetails[0].max_version}/>
              }
            </div>
        </div>
    </div>
    <div className='mt-10 ml-10 mr-10 lg:h-[480px] lg:grid lg:grid-cols-3 gap-4'>
        <div className='h-[480px] lg:col-span-2'>
            <p className='text-xl font-bold mb-5'>Downloads over time</p>
            <ClientComponent type={'line'} data={downloadsOverTime}/>
        </div>
        <div className='h-[480px] mt-20 lg:mt-0'>
            <p className='text-xl font-bold mb-5'>Top versions</p>
            <ClientComponent type={'pie'} data={versions} options={ {filter_name: 'version'} }/>
        </div>
    </div>
    <div className='mt-20 ml-10 mr-10'>
      <div className='h-[480px]'>
            <p className='text-xl font-bold mb-5'>Downloads by Python version over time</p>
            <ClientComponent type={'bar'} data={downloadsOverTimeByPython} options={{stack: true}}/>
      </div>
    </div>

    <div className='mt-20 ml-10 mr-10 h-[480px]'>
      <div className='h-[480px]'>
            <p className='text-xl font-bold mb-5'>Downloads by system over time</p>
            <ClientComponent type={'bar'} data={downloadsOverTimeBySystem} options={{stack: false}}/>
      </div>
    </div>
    
    <div className='mt-20 ml-10 mr-10 h-[480px] lg:grid xl:grid-cols-3 gap-4 mb-32'>
        <div className='h-[480px] xl:col-span-2'>
              <p className='text-xl font-bold mb-5'>Downloads by country</p>
              <ClientComponent type={'map'} data={downloadsByCountry}/>
        </div>
        <div className='h-[480px] xl:col-span-1 mt-20 xl:mt-0'>
              <p className='text-xl font-bold mb-5'>File types by installer</p>
              <ClientComponent type={'radar'} data={fileTypesByInstaller}/>
          </div>
    </div>
  </div>
)
}
