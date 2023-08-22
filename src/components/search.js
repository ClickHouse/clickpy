'use client'
import { MagnifyingGlassIcon, ChevronRightIcon } from '@heroicons/react/20/solid'
import { useEffect, useState } from "react"
import { useRouter } from 'next/navigation'


export default function Search() {
  const [query, setQuery] = useState("")
  const [packages, setPackages] = useState([])
  const router = useRouter()

  const getPackages = async () => {
    if (query != '') { 
        const response = await fetch(`/packages?query=${query}`)
        return await response.json()
    }
    return []
  }

  //https://levelup.gitconnected.com/create-a-debounce-hook-for-search-box-auto-completion-f9a2b18eb28c
  const useDebounce = (value, timeout) => {
      const [state, setState] = useState(value);    
      useEffect(() => {
          const handler = setTimeout(() => setState(value), timeout);        
          return () => clearTimeout(handler);
      }, [value, timeout]);    
      return state;
  }

  const debouncedQuery = useDebounce(query, 300)

  const onClick = (package_name) => {
    setPackages([])
    router.push(`/dashboard/${package_name}`)
  }

  useEffect(() => {
    getPackages().then(results => {
      setPackages(results)
    })
  }, [debouncedQuery])

  return (
    <div className="bg-neutral-725 lg:w-[400px] sm:w-[300px]">
      <div className="mt-2 h-12 flex rounded-md shadow-sm ">
        <div className="relative flex flex-grow items-center flex-col items-stretch">
          <div className="flex">
            <div className="pointer-events-none py-2 flex items-center pl-3">
              <MagnifyingGlassIcon className="h-6 w-6 text-slate-400" aria-hidden="true" />
            </div>
            <input type="package" name="package" id="package"
              className="rounded-md items-center outline-none bg-neutral-725 border-1 py-1.5 pl-3 placeholder:tracking-wide placeholder:font-light font-normal text-slate-400 placeholder:text-slate-400 text-norma; leading-5"
              placeholder="Search for a package"
              onChange={(e) => {
                setQuery(e.target.value)
              }}
            />
          </div>
          {
            packages.length > 0 && (
              <div className="pr-3 pl-5 bg-neutral-725 mt-5 font-normal rounded-b-xl shadow-sm border-1 w-full">
                <ul role="list" className="divide-y divide-white/5 w-full">
                  {
                    packages.map((p,i) => (
                      <li onClick={() => {onClick(p.project)}} key={`package-${i}`} className="cursor-pointer flex space-x-2 py-4 hover:bg-[url('/highlight.svg')]">
                        <div className="flex items-center gap-x-2 w-full">
                            <div className="flex items-center flex-auto">
                              <h2 className="min-w-0 text-sm text-white">
                                  <span className="truncate">{p.project}</span>
                              </h2>
                            </div>
                          <div className="flex gap-3">
                            <div>{p.c}</div>
                          </div>
                          <ChevronRightIcon className="h-6 w-6 flex-none text-primary" aria-hidden="true" />
                        </div>
                      </li>
                    ))
                  }

                </ul>
              </div>
            )
          }
        </div>
      </div>
    </div>
  )
}
