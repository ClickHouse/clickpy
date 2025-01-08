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
    let displayBadge = false
    let displayRank = false

    if (data.length > 0) {
        if (data[0].rank > 0) {
            displayRank = true
        }            
        if (data[0].percentile > 0 && data[0].percentile <= 1) {
            badgeImage = '/badges/gold.svg'
            displayBadge = true
            label = 'TOP 1%'
        } else if (data[0].percentile > 0 && data[0].percentile <= 10) {
            badgeImage = '/badges/silver.svg'
            displayBadge = true
            label = 'TOP 10%'
        } else if (data[0].percentile > 0 && data[0].percentile <= 25) {
            badgeImage = '/badges/bronze.svg'
            displayBadge = true
            label = 'TOP 25%'
        }
        rank = numeral(data[0].rank).format('0,0')
    }

    return (
        displayRank && 
        <div className='grid justify-items-end min-w-[200px]'>
            <div className='flex'>
            <div className='flex flex-col items-end h-[60px]'>
                <p className='font-inter font-bold text-3xl text-[#FBE9B9] whitespace-nowrap'># {rank}</p>
                <div className='flex items-center'>
                    <div className='flex flex-row'>
                        <p className='font-inter text-slate-500 mx-1 whitespace-nowrap'>{label}</p>
                        {link && <Link href={link} target='_blank' className='w-5'>
                            <ArrowTopRightOnSquareIcon className='h-5 w-5 flex-none icon-hover' aria-hidden='true' />
                        </Link>}
                    </div>
                </div>
            </div>
            {displayBadge &&
            <div className='flex items-center h-full ml-4'>
                <Image
                    src={badgeImage}
                    alt={`${package_name} ranking badge`}
                    width={34}
                    height={48}
                />
                </div>}
            </div>
        </div>
    );
}
