'use client';
import {
  MagnifyingGlassIcon,
  ChevronRightIcon
} from '@heroicons/react/20/solid';
import { useCallback, useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';

export default function Search({ package_name = '' }) {
  const [query, setQuery] = useState(package_name);
  const [cursor, setCursor] = useState(0);
  const [showPackages, setShowPackages] = useState(false);
  const [packages, setPackages] = useState([]);
  const router = useRouter();

  const getPackages = useCallback(async () => {
    if (query != '') {
      const response = await fetch(`/packages?query=${query}`);
      return await response.json();
    }
    return [];
  }, [query]);

  const containerRef = useRef(null);

  //https://levelup.gitconnected.com/create-a-debounce-hook-for-search-box-auto-completion-f9a2b18eb28c
  const useDebounce = (value, timeout) => {
    const [state, setState] = useState(value);
    useEffect(() => {
      const handler = setTimeout(() => setState(value), timeout);
      return () => clearTimeout(handler);
    }, [value, timeout]);
    return state;
  };

  const debouncedQuery = useDebounce(query, 100);

  const onClick = (package_name) => {
    setQuery(package_name);
    setShowPackages(false);
    setPackages([]);
    router.push(`/dashboard/${package_name}`);
  };

  const onKeyDown = (e) => {
    // arrow up/down button should select next/previous list element
    if (e.keyCode === 38 && cursor > 0) {
      setCursor(cursor - 1);
    } else if (e.keyCode === 40 && cursor < packages.length - 1) {
      setCursor(cursor + 1);
    } else if (e.keyCode === 13 && cursor > 0 && cursor < packages.length - 1) {
      // on return
      const package_name = packages[cursor];
      router.push(`/dashboard/${package_name.project}`);
    }
  };

  useEffect(() => {
    getPackages().then((results) => {
      setPackages(results);
    });
  }, [debouncedQuery, getPackages]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target)
      ) {
        setShowPackages(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div
      className='sm:w-[400px] min-w-[300px] h-[50px] max-w-[400px]'
      ref={containerRef}>
      <div className='flex'>
        <div className='relative flex flex-grow flex-col items-stretch'>
          <div className='flex'>
            <div className='pointer-events-none flex items-center z-10'>
              <MagnifyingGlassIcon
                className='h-6 w-6 text-neutral-400'
                aria-hidden='true'
              />
            </div>
            <input
              tabIndex='0'
              type='package'
              name='package'
              id='package'
              value={query}
              className='rounded-md bg-neutral-725 items-center outline-none placeholder:tracking-wide
							placeholder:font-light hover:placeholder:text-neutral-0 font-normal text-neutral-400
							hover:text-neutral-0 focus:text-neutral-0 placeholder:text-neutral-400 w-full py-4
							pl-14 -ml-9 leading-5 cursor-pointer border box-border hover:border-neutral-700 border-slate-700
							hover:border-opacity-50 transition-all duration-300 ease-in-out h-[50px]'
              placeholder='Search for a package'
              onChange={(e) => {
                setShowPackages(true);
                setQuery(e.target.value);
              }}
              onKeyDown={(e) => {
                onKeyDown(e);
              }}
            />
          </div>
          {packages.length > 0 && showPackages && (
            <div className='pl-5 -ml-3 bg-neutral-725 font-normal rounded-b-xl border-t border-primary-300 shadow-sm w-full z-10'>
              <ul role='list' className='divide-y divide-white/5 w-full'>
                {packages.map((p, i) => (
                  <li
                    onClick={() => {
                      onClick(p.project);
                    }}
                    key={`package-${i}`}
                    className={`cursor-pointer flex space-x-2 py-4 hover:bg-[url("/highlight.svg")] ${
                      cursor === i ? 'bg-[url("/highlight.svg")]' : null
                    }`}>
                    <div className='flex items-center gap-x-2 w-full pr-2'>
                      <div className='flex items-center flex-auto'>
                        <h2 className='min-w-0 text-sm text-white'>
                          <span className='truncate'>{p.project}</span>
                        </h2>
                      </div>
                      <div className='flex gap-3'>
                        <div>{p.c}</div>
                      </div>
                      <ChevronRightIcon
                        className='h-6 w-6 flex-none text-primary'
                        aria-hidden='true'
                      />
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
