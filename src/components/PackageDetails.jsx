import { ArrowTopRightOnSquareIcon } from '@heroicons/react/20/solid';
import Image from 'next/image';

export default function PackageDetails({
  name,
  author,
  author_email,
  license,
  summary,
  home_page,
  repo_name
}) {
  return (
    <div>
      <div className='flex items-center text-center'>
        <p className='text-4xl font-bold mr-5'>{name}</p>
        {home_page && (
          <a href={home_page} target='_blank' className='text-center pt-2'>
            <button type='button'>
              <ArrowTopRightOnSquareIcon
                className={`h-8 w-8 fill-white hover:fill-[#faff69]`}
                aria-hidden='true'
              />
            </button>
          </a>
        )
        }
        {
          repo_name && repo_name != '' && (
            <a href={`https://github.com/${repo_name}`} target='_blank' className='text-center pt-2'>
              <button type='button'>
                <Image
                  width={16}
                  height={16}
                  className='h-6 w-6 min-w-6 min-h-6 bg-neutral-850 rounded-lg ml-2 hover:fill-[#faff69] fill-white'
                  src={'/github.svg'}
                  alt={`${name} Github`}
                />
              </button>
            </a>
          ) 
        }
      </div>
      { author || author_email || license || summary ? (
        <div className='mt-5 leading-6 tracking-wide text-slate-200'>
          {author && <p>Author: {author}</p>}
          {author_email && <p>Author Email: {author_email}</p>}
          {license && <p>License: { license.split(' ').slice(0, 10).join(' ')}{license.split(' ').length > 10 && '...' }</p>}
          {summary && (
            <p>Summary: { summary.split(' ').slice(0, 10).join(' ')}{summary.split(' ').length > 10 && '...' }</p>
          )}
        </div>
      ) : (
        <div className='mt-5 leading-6 tracking-wide text-slate-200'>
          No package details available
        </div>
      )
      }
    </div>
  );
}
