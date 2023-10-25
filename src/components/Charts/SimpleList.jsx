import React from 'react';
import Link from 'next/link';

export default function SimpleList({ data, title, subtitle, link_prefix }) {
  return (
    <div className='rounded-lg bg-slate-850 border border-slate-700 h-full justify-start flex flex-col'>
      {title && (
        <div className='px-6 pt-4 pb-0 flex-row flex justify-between'>
          {title}
          <p
            className={
              'transition-all duration-300 ease-in-out hover:shadow-xl text-neutral-500'
            }>
            {subtitle}
          </p>
        </div>
      )}
      <div className='text-left ml-6 mt-6 '>
        {data.map((p) => {
          return (
            <div className='mb-2 mr-4' key={p.title}>
              <Link
                href={`${link_prefix}${p.title}`}
                className='text-[#FAFF69] leading-6'>
                {p.title}
              </Link>{' '}
              <span className='text-start text-[#696E79]'>{`- ${p.subtitle}`}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
