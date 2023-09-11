import QueryToggle from './toggle'
import Image from 'next/image'

export default function Header() {
	return (
		<header className='bg-neutral-800 shadow-lg border-b-2 border-neutral-725'>
			<nav
				className='mx-auto flex items-center justify-between p-3 lg:px-8 w-full xl:w-11/12 2xl:w-10/12'
				aria-label='Global'
			>
				<div className='flex lg:flex-1'>
					<a href='#' className='p-1'>
						<span className='sr-only'>ClickPy</span>
						<Image
							className='w-24'
							src='/click_py.svg'
							alt=''
							width='96'
							height='32'
						/>
					</a>
				</div>

				<div className='hidden lg:flex lg:flex-1 lg:justify-end items-center'>
					<div className='mr-2'>
						<QueryToggle />
					</div>
					<div>
						<p className='text-sm text-neutral-0'>
							Powered by &nbsp;
							<a className='text-primary-300 hover:underline' href='http://clickhouse.com/' target='_blank'>
								ClickHouse
							</a>
						</p>
					</div>
				</div>
			</nav>
		</header>
	)
}
