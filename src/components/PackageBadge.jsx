import { getPackageRanking } from '@/utils/clickhouse';
import Image from 'next/image';
import numeral from 'numeral';
import Link from 'next/link';
import {
    ArrowTopRightOnSquareIcon,
  } from '@heroicons/react/20/solid';

export default async function PackageBadge({ package_name, min_date, max_date, country_code }) {
    const [link, data] = await getPackageRanking(package_name, min_date, max_date, country_code)

    let badgeImage;
    let label;
    let rank;

    if (data.length > 0) {
        if (data[0].percentile < 1) {
            badgeImage = '/badges/gold.svg'
            label = 'TOP 1%'
            rank = numeral(data[0].rank).format('0.0a')
        } else if (data[0].percentile < 10) {
            badgeImage = '/badges/silver.svg'
            label = 'TOP 10%'
            rank = numeral(data[0].rank).format('0.0a')
        } else {
            badgeImage = '/badges/bronze.svg'
            rank = numeral(data[0].rank).format('0.0a')
        }
    } else {
        badgeImage = '/badges/bronze.svg'
    }
    
    return (
        <div className='flex'>
            <Image
                src={badgeImage}
                alt={`${package_name} ranking badge`}
                width={40}
                height={40}
                className='m-1'
            />
            <div><p className='font-inter text-slate-500'>{label}</p><p className='font-inter font-bold text-3xl text-[#FBE9B9]'>{rank}</p></div>

            {link && <Link href={link} target='_blank' className='w-5 ml-1'>
              <ArrowTopRightOnSquareIcon className='h-5 w-5 flex-none icon-hover' aria-hidden='true'/>
          </Link>}   
        </div>
    );
}
