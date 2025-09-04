'use client';
import HeatMap from './Charts/HeatMap';
import HorizontalBar from './Charts/HorizontalBar';
import SimpleList from './Charts/SimpleList';
import Image from 'next/image';
import PunchCard from './Charts/PunchCard';
import { useRouter } from 'next/navigation';
import { formatNumber } from '@/utils/utils';
import Link from 'next/link';
import {
  ArrowTopRightOnSquareIcon,
} from '@heroicons/react/20/solid';

export default function Summary({
  packages,
  recent_releases,
  emerging_repos,
  needing_refresh,
  hot_packages
}) {
  const router = useRouter();

  const total_top_downloads = packages[1]
    .map((p) => p.c)
    .reduce((ps, a) => {
      return Number(ps) + Number(a);
    }, 0);

  const total_hot_downloads = hot_packages[1]
    .map((p) => p.z)
    .reduce((ps, a) => {
      return Number(ps) + Number(a);
    }, 0);

  return (
    <div className='flex flex-col grow xl:grid xl:grid-cols-6 gap-6 min-w-[360px] mb-16'>
      <div className='xl:col-span-3 h-[360px]'>
        <HeatMap
          data={recent_releases[1]}
          title={
            <div className='flex space-x-2'>
              <Image alt='recent' src='/recent.svg' width={20} height={20} />
              <span className='text-white font-bold space-x-0.5'>
                Recent releases
              </span>
            </div>
          }
          subtitle={'On popular packages'}
          onClick={(value) => {
            router.push(`/dashboard/${value[1]}`);
          }}
          link={recent_releases[0]}
        />
      </div>
      <div className='justify-self align-self xl:col-span-3 h-[360px]'>
        <HorizontalBar
          data={packages[1]
            .map((p) => {
              return { x: p.project, y: p.c, name: 'counts' };
            })}
          header={
            <div className='px-6 pt-4 pb-0 flex-row flex justify-between items-end'>
              <div className='flex space-x-2'>
                <Image alt='recent' src='/popular.svg' width={20} height={20} />
                <span className='text-white font-bold space-x-0.5'>
                  Top Repos
                </span>
              </div>
            <div className='flex flex-row justify-center items-center'>
              <p
                className={
                  'transition-all duration-300 ease-in-out hover:shadow-xl text-neutral-500 text-sm'
                }>
                {`${formatNumber(total_top_downloads)} downloads`}
              </p>
              <Link href={packages[0]} target='_blank' className='w-4 ml-2'>
                  <ArrowTopRightOnSquareIcon className='h-4 w-4 flex-none icon-hover' aria-hidden='true'/>
              </Link>  
            </div>
          </div>
          }
          onClick={(value) => {
            router.push(`/dashboard/${value}`);
          }}
        />
      </div>
      <div className='xl:col-span-2'>
        <SimpleList
          link_prefix={'/dashboard/'}
          data={emerging_repos[1].map((p) => {
            return {
              title: p.name,
              subtitle: `${formatNumber(
                Number(p.c)
              )} downloads in the last 3 months`
            };
          })}
          title={
            <div className='flex space-x-2'>
              <Image alt='recent' src='/emerging.svg' width={20} height={20} />
              <span className='text-white font-bold space-x-0.5'>
                Emerging repos
              </span>
            </div>
          }
          subtitle={`Top ${emerging_repos[1].length}`}
          link = {emerging_repos[0]}
        />
      </div>
      <div className='xl:col-span-2'>
        <SimpleList
          link_prefix={'/dashboard/'}
          data={needing_refresh[1].map((p) => {
            return {
              title: p.name,
              subtitle: `${formatNumber(
                Number(p.c)
              )} downloads, last updated on ${p.last_updated}`
            };
          })}
          title={
            <div className='flex space-x-2'>
              <Image alt='recent' src='/refresh.svg' width={20} height={20} />
              <span className='text-white font-bold space-x-0.5'>
                Stable packages
              </span>
            </div>
          }
          subtitle={`Top ${needing_refresh[1].length}`}
          link = {needing_refresh[0]}
        />
      </div>
      <div className='xl:col-span-2'>
        <PunchCard
          data={hot_packages[1]}
          title={
            <div className='flex space-x-2'>
              <Image alt='recent' src='/hot.svg' width={20} height={20} />
              <span className='text-white font-bold space-x-0.5'>
                Hot packages
              </span>
            </div>
          }
          subtitle={`${formatNumber(total_hot_downloads)} downloads`}
          stack={true}
          labelMargin={200}
          onClick={(value) => {
            router.push(`/dashboard/${value[1]}`);
          }}
          scale='log'
          link = {hot_packages[0]}
        />
      </div>
    </div>
  );
}
