import Link from 'next/link'
import Search from '@/components/search'
import QueryToggle from '@/components/toggle'
import { ArrowTopRightOnSquareIcon } from '@heroicons/react/20/solid'

export default async function DashboardLayout({
    children, 
  }) {
    return (
        <>
          <div>
            <div className="hidden fixed inset-y-0 z-50 xl:flex w-20 flex-col">
              <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-nav px-2 pb-2">
                <div className="flex h-16 shrink-0 items-center mt-6 ml-0">
                  <Link href='/'>
                    <img
                      className="h-16 w-16"
                      src="/logo.svg"
                      alt="ClickPy"
                    />
                  </Link>
                </div>
                <nav className="flex flex-1 flex-col">
                    {/* maybe later nav  */}
                </nav>
              </div>
            </div>
            <div className="flex flex-row mt-6 justify-between">
                <div className="xl:ml-32 ml-10">
                    <Search/>
                </div>
                <div className="hidden xl:flex justify-end mr-8">
                    <div className="mr-2">
                        <QueryToggle/>
                    </div>
                    <a href="https://clickhouse.com/cloud" target="_blank">
                        <button type="button" className="inline-flex items-center gap-x-2 rounded-md bg-primary-300 px-3.5 py-2.5 text-sm font-inter text-black shadow-sm  focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 ">
                            Visit ClickHouse Cloud
                            <ArrowTopRightOnSquareIcon className="-mr-0.5 h-5 w-5" aria-hidden="true" />
                        </button>
                    </a>
                </div>              
            </div>
            {children}
          </div>
        </>
      )
  }
