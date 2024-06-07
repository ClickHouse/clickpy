import Image from 'next/image';
import Link from 'next/link';

export default function Header() {
  return (
    <header className='bg-neutral-800 shadow-lg border-b-2 border-neutral-725 md:sticky md:top-0 z-20 opacity-[98%] backdrop-filter backdrop-blur-lg bg-opacity-90 h-[82px]'>
      <nav
        className='mx-auto flex items-center justify-between md:px-4 lg:px-16 w-11/12 lg:w-full xl:w-11/12 h-[82px]'
        aria-label='Global'>
        <div className='items-center flex gap-8'>
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

          <div className='flex width-20 max-w-[140px] lg:mt-2'>
            <div className='grow width-20 max-w-[100px]'>
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
            <Link href='https://github.com/ClickHouse/clickpy' target='_blank'>
                  <Image
                    className='w-8 h-8'
                    src='/github.svg'
                    alt='ClickPy Github'
                    width='32'
                    height='32'
                  />
            </Link>
          </div>
        </div>
      </nav>
    </header>
  );
}
