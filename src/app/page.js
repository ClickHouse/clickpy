import Header from '@/components/header'
import Search from '@/components/search'
import Summary from '@/components/summary'
import { getTotalDownloads } from "@/utils/clickhouse";

import 'server-only'

export default function Home() {
  
  const total_downloads = await getTotalDownloads()
  
	return (
		<div>
			{/* Header */}
			<Header />
			<main className="isolate h-screen">
				<div className="pt-14">
					<div className="pt-24 sm:pt-24">
						<div className="max-w-8xl px-6 lg:px-8">
							<div className="text-center flex items-center flex-col justify-center">
								<h1 className="text-4xl font-bold font-inter lg:text-5xl">
									Analytics for PyPI packages
								</h1>
								<p className="mt-6 text-lg leading-8 text-white">
									Browse through{' '}
									<span className="text-primary-300">{Number(total_downloads.projects).toLocaleString("en-US")}</span> Python
									packages from PyPI and over <span className="text-primary font-bold">{total_downloads.total}</span> 
								</p>
								<div className="mt-10 flex items-center justify-center gap-x-6">
									<Search />
								</div>
								<div className="mt-16 flow-root sm:mt-24 w-full md:w-5/6 px-4">
									<Summary />
								</div>
							</div>
						</div>
					</div>
				</div>
			</main>
		</div>
	)
}
