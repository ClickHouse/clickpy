import Image from 'next/image';
import Link from 'next/link';

export default function PackageDetails({
  name,
  authors,
  author_email,
  licenses,
  summary,
  repo_name
}) {
  return (
    <div>
      <div className='flex items-center text-center'>
        <h1 className='text-4xl font-bold mr-5'>{name}</h1>
        {repo_name && String(repo_name).trim().length > 0 && (
          <Link href={`https://github.com/${repo_name}`} target='_blank' className='text-center pt-2'>
            <Image
              width={16}
              height={16}
              className='h-6 w-6 min-w-6 min-h-6 bg-neutral-850 rounded-lg ml-2 hover:fill-[#faff69] fill-white'
              src={'/github.svg'}
              alt={`${name} Github`}
            />
          </Link>
        )}
      </div>
      {(authors || author_email || licenses || summary) ? (
        <ul className='mt-5 leading-6 tracking-wide text-slate-300 max-w-[600px] space-y-2'>
          {authors && (
            <li>
              <strong className='font-semibold text-slate-100'>Authors: </strong>
              {authors.split(',').length > 3 ? (
                <>
                  {authors.split(',').slice(0, 3).join(',').trim()}...
                  <span
                    className='hover:text-blue-300 underline decoration-dotted'
                    title={authors}
                  >
                    (+{authors.split(',').length - 3} more)
                  </span>
                </>
              ) : authors}
            </li>
          )}
          {author_email && (
            <li>
              <strong className='font-semibold text-slate-100'>Author Email: </strong>
              {author_email}
            </li>
          )}
          {licenses && (
            <li>
              <strong className='font-semibold text-slate-100'>License: </strong>
              {licenses.replace(/^[-\s]+|[-\s]+$/g, '').split(' ').slice(0, 10).join(' ')}{licenses.split(' ').length > 10 && '...'}
            </li>
          )}
          {summary && (
            <li>
              <strong className='font-semibold text-slate-100'>Summary: </strong>
              {summary.split(' ').length > 25 ? `${summary.split(' ').slice(0, 25).join(' ')}...` : summary}
            </li>
          )}
        </ul>
      ) : (
        <div className='mt-5 leading-6 tracking-wide text-slate-200'>
          No package details available
        </div>
      )}
    </div>
  );
}
