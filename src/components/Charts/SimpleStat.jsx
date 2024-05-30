import Image from 'next/image';
import Link from 'next/link';
import {
  ArrowTopRightOnSquareIcon,
} from '@heroicons/react/20/solid';

export default function SimpleStat({ value, subtitle, logo, link }) {
  return (
    <div className='min-w-[250px] rounded-lg bg-slate-850 flex gap-4 p-4 h-24  w-full min-w-72 border border-slate-700'>
      <div className='items-center flex grow'>
        <Image
          width={16}
          height={16}
          className='h-16 w-16 min-w-16 min-h-16 bg-neutral-850 rounded-lg'
          src={logo}
          alt={subtitle}
        />
        <div className='ml-2 mr-4'>
          <p className='text-xl mr-2 font-bold'>{value}</p>
          <p className='text-slate-200'>{subtitle}</p>
        </div>
      </div>

      <div className='flex-row flex justify-end w-4 mt-[-12px] mr-[-12px]'>
        { link && <Link href={link} target='_blank' className='w-5 ml-5'>
            <ArrowTopRightOnSquareIcon className='h-5 w-5 flex-none icon-hover' aria-hidden='true'/>
        </Link>} 
      </div>
    </div>
  );
}
