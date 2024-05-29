import Image from 'next/image';
import Link from 'next/link';
import {
  ArrowTopRightOnSquareIcon,
} from '@heroicons/react/20/solid';

export default function Version({ current, latest, link }) {
  return (
    <div className='rounded-lg col-span-1 bg-slate-850 flex md:justify-between gap-4 p-4 h-24 w-full border border-slate-700'>
      <div className='items-center flex grow'>
        <Image
          width={16}
          height={16}
          className='h-16 w-16 min-w-16 min-h-16 bg-neutral-850 rounded-lg'
          src='/version.svg'
          alt='Version'
        />
        <div className='ml-2 mr-4'>
          <p className='text-xl mr-2 font-bold'>{current}</p>
          <p className='text-slate-200'>version</p>
        </div>
        <div>
          <p className='text-xl mr-2 font-bold'>{latest}</p>
          <p className='text-slate-200'>latest version</p>
        </div>
      </div>

      <div className='flex-row flex justify-end w-4 mt-[-12px] mr-[-12px]'>
        { link && <Link href={link} target='_blank' className='w-5 ml-5'>
            <ArrowTopRightOnSquareIcon className='h-5 w-5 flex-none text-primary' aria-hidden='true'/>
        </Link>} 
      </div>
    </div>
  );
}
