import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Search from '@/components/Search';
import Summary from '@/components/Summary';
import Ping from '@/components/Ping';

import {
  getTotalDownloads,
  getProjectCount,
  getRecentReleases,
  getPopularEmergingRepos,
  getPopularReposNeedingRefresh,
  hotPackages
} from '@/utils/clickhouse';
import 'server-only';

export const metadata = {
  title: 'ClickPy - Python package analytics',
  description: 'Free Analytics service for Python package downloads, powered by ClickHouse',
}

export const revalidate = 3600

export default async function Home() {
  const total_downloads = await getTotalDownloads();
  const projects = await getProjectCount();
  const [recent_releases, emerging_repos, needing_refresh, hot_packages] =
    await Promise.all([
      getRecentReleases(projects[1].map((p) => p.project)),
      getPopularEmergingRepos(),
      getPopularReposNeedingRefresh(),
      hotPackages()
  ]);


  return (
    <div>
      {/* Header */}
      <Header />
      <Ping name={`landing`}/>
      <main className='isolate h-screen'>
        <div className='pt-6'>
          <div className='pt-6 md:pt-24'>
            <div className='lg:px-16 flex justify-center mx-auto w-full xl:w-11/12'>
              <div className='text-center flex items-center flex-col justify-center'>
                <h1 className='text-4xl font-bold font-inter lg:text-5xl px-4 md:px-0'>
                  Analytics for PyPI packages
                </h1>
                <p className='px-4 mt-6 text-lg leading-8 text-white'>
                  Browse through{' '}
                  <a className='text-primary-300 hover:underline' href={`${total_downloads[0]}&run_query=true`} target='_blank'>
                    {Number(total_downloads[1][0].projects).toLocaleString('en-US')}
                  </a>{' '}
                  Python packages from PyPI and over{' '}
                  <a className='text-primary font-bold hover:underline' href={`${total_downloads[0]}&run_query=true`} target='_blank'>
                    {total_downloads[1][0].total}
                  </a>{' '}
                  downloads, updated daily
                </p>
                <div className='mt-10 flex items-center justify-center h-8'>
                  <Search />
                </div>
                <div className='mt-16 flow-root sm:mt-24 w-11/12 lg:w-full'>
                  <Summary
                    packages={projects}
                    recent_releases={recent_releases}
                    emerging_repos={emerging_repos}
                    needing_refresh={needing_refresh}
                    hot_packages={hot_packages}
                  />
                </div>
              </div>
            </div>
            <div className='mb-8 w-10/12 flex justify-center mx-auto max-w-[1680px]'>
              <Footer/>
            </div>
            
          </div>
          
        </div>
        
      </main>

    </div>
  );
}
