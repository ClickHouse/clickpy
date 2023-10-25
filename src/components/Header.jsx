import QueryToggle from './QueryToggle';
import Image from 'next/image';
import Link from 'next/link';

export default function Header() {
  return (
    <header className='bg-neutral-800 shadow-lg border-b-2 border-neutral-725 md:sticky md:top-0 z-20 opacity-[98%] backdrop-filter backdrop-blur-lg bg-opacity-90 h-[82px]'>
      <nav
        className='mx-auto flex items-center justify-between py-5 md:px-4 lg:px-16 w-11/12 lg:w-full xl:w-11/12 h-[82px]'
        aria-label='Global'>
        <div className='items-center flex gap-8 mt-0.5'>
          <Link href='/'>
            <Image
              className='w-24'
              src='/click_py.svg'
              alt='ClickPy by ClickHouse'
              width='96'
              height='32'
            />
          </Link>
        </div>

        <div className='lg:flex lg:flex-1 lg:justify-end items-center'>
          <div className='mr-2 hidden lg:flex'>
            <QueryToggle />
          </div>

          <div className='flex grow width-20 max-w-[80px] lg:mt-2'>
            <p className='text-sm text-neutral-0'>
              Powered by &nbsp;
              <a
                className='text-primary-300 hover:underline'
                href='http://clickhouse.com/'
                target='_blank'>
                ClickHouse
              </a>
            </p>
          </div>
        </div>
      </nav>
    </header>
  );
}
