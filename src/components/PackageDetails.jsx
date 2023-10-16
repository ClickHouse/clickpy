import { ArrowTopRightOnSquareIcon } from '@heroicons/react/20/solid'

export default function PackageDetails({ name, author, author_email, license, summary, home_page }) {
  return (
    <div>
      <div className='flex items-center text-center'>
        <p className='text-4xl font-bold mr-5'>{name}</p>
        {home_page && <a href={home_page} target='_blank' className='text-center pt-1'>
          <button type='button'><ArrowTopRightOnSquareIcon className={`h-4 w-4 fill-white`} aria-hidden='true' /></button>
        </a>}
      </div>
      {
        <div className='mt-5 leading-6 tracking-wide text-slate-200'>
          {author && <p>Author: {author}</p>}
          {author_email && <p>Author Email: {author_email}</p>}
          {license && <p>License: {license}</p>}
          {summary && <p>Summary: {summary}</p>}
        </div>
      }

    </div>
  )
}
