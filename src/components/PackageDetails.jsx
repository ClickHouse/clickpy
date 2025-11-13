import { ArrowTopRightOnSquareIcon } from '@heroicons/react/20/solid';
import Image from 'next/image';

export default function PackageDetails({
  name,
  authors,
  author_email,
  licenses,
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
      { authors || author_email || licenses || summary ? (
        <div className='mt-5 leading-6 tracking-wide text-slate-200 max-w-[600px] space-y-2'>
          {authors && (
            <div>
              <span className='font-semibold text-slate-100'>Authors: </span>
              <span className='text-slate-300'>
                {authors.split(',').length > 3 
                  ? (
                    <>
                      {authors.split(',').slice(0, 3).join(',').trim()}... 
                      <span 
                        className='hover:text-blue-300 underline decoration-dotted'
                        title={authors}
                      >
                        (+{authors.split(',').length - 3} more)
                      </span>
                    </>
                  )
                  : authors
                }
              </span>
            </div>
          )}
          {author_email && (
            <div>
              <span className='font-semibold text-slate-100'>Author Email: </span>
              <span className='text-slate-300'>{author_email}</span>
            </div>
          )}
          {licenses && (
            <div>
              <span className='font-semibold text-slate-100'>License: </span>
              <span className='text-slate-300'>
                {licenses.replace(/^[-\s]+|[-\s]+$/g, '').split(' ').slice(0, 10).join(' ')}{licenses.split(' ').length > 10 && '...'}
              </span>
            </div>
          )}
          {summary && (
            <div>
              <span className='font-semibold text-slate-100'>Summary: </span>
              <span className='text-slate-300'>
                {summary.split(' ').length > 25 
                  ? `${summary.split(' ').slice(0, 25).join(' ')}...`
                  : summary
                }
              </span>
            </div>
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
