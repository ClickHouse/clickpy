import Header from '@/components/header'
import Search from '@/components/search'
import Summary from '@/components/summary'
import { getTotalDownloads, getProjectCount, getRecentReleases, getPopularEmergingRepos, getPopularReposNeedingRefresh, hotPackages } from '@/utils/clickhouse'
import 'server-only'

export default async function Home() {
	const total_downloads = await getTotalDownloads()
	const packages = await getProjectCount()
	const [recent_releases, emerging_repos, needing_refresh, hot_packages] = await Promise.all(
        [
            getRecentReleases(packages.map(p => p.project)),
            getPopularEmergingRepos(),
            getPopularReposNeedingRefresh(),
            hotPackages()
        ]
    )
	console.log(recent_releases)

	return (
		<div>
			{/* Header */}
			<Header />
			<main className='isolate h-screen'>
				<div className='pt-14'>
					<div className='pt-12 md:pt-24'>
						<div className='max-w-8xl px-6 lg:px-8'>
							<div className='text-center flex items-center flex-col justify-center'>
								<h1 className='text-4xl font-bold font-inter lg:text-5xl'>
									Analytics for PyPI packages
								</h1>
								<p className='mt-6 text-lg leading-8 text-white'>
									Browse through{' '}
									<span className='text-primary-300'>
										{Number(total_downloads.projects).toLocaleString('en-US')}
									</span>{' '}
									Python packages from PyPI and over{' '}
									<span className='text-primary font-bold'>
										{total_downloads.total}
									</span>
									{' '}downloads
								</p>
								<div className='mt-10 flex items-center justify-center h-8'>
									<Search/>
								</div>
								<div className='mt-16 flow-root sm:mt-24 w-full md:w-5/6 md:px-4'>
									<Summary packages={packages} recent_releases={recent_releases} emerging_repos={emerging_repos} needing_refresh={needing_refresh} hot_packages={hot_packages}/>
								</div>
							</div>
						</div>
					</div>
				</div>
			</main>
		</div>
	)
}
