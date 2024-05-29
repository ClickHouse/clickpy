import React from 'react';
import Link from 'next/link';
import {
  ArrowTopRightOnSquareIcon,
} from '@heroicons/react/20/solid';


export default function SimpleList({ data, title, subtitle, link_prefix, link }) {
  return (
    <div className='rounded-lg bg-slate-850 border border-slate-700 h-full justify-start flex flex-col'>
      {title && (
        <div className='px-6 pt-4 pb-0 flex-row flex justify-between items-end'>
          {title}
          <div className='flex flex-row justify-center items-center'>
            <p
              className={
                'transition-all duration-300 ease-in-out hover:shadow-xl text-neutral-500 text-sm'
              }>
              {subtitle}
            </p>
            { link && <Link href={link} target='_blank' className='w-4 ml-4'>
                  <ArrowTopRightOnSquareIcon
                          className='h-4 w-4 flex-none icon-hover'
                          aria-hidden='true'
                  />
              </Link>}    
          </div>
        </div>
      )}
      <div className='text-left ml-6 mt-6 '>
        {data.map((p) => {
          return (
            <div className='mb-2 mr-4' key={p.title}>
              <Link
                href={`${link_prefix}${p.title}`}
                className='text-[#FAFF69] leading-6 hover:underline'>
                {p.title}
              </Link>{' '}
              <span className='text-start text-neutral-400 text-sm'>{`- ${p.subtitle}`}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
