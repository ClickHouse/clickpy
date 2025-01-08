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

    if (data.length > 0) {
        if (data[0].rank <= 10) {
            label = 'TOP 10'
            if (data[0].rank == 1) {
                badgeImage = '/badges/gold.svg'
                displayBadge = true
            } else if (data[0].rank == 2) {
                badgeImage = '/badges/silver.svg'
                displayBadge = true
            } else if (data[0].rank == 3) {
                badgeImage = '/badges/bronze.svg'
                displayBadge = true
            }
        }
        rank = numeral(data[0].rank).format('0,0')
    }

    return (

        <div className='flex flex-col items-end w-[150px]'>
            <p className='font-inter font-bold text-3xl text-[#FBE9B9] whitespace-nowrap'># {rank}</p>

            <div className='flex items-center h-[55px]'>
                {displayBadge &&
                <Image
                    src={badgeImage}
                    alt={`${package_name} ranking badge`}
                    width={25}
                    height={25}
                    className='m-1'
                /> }
                <div className='flex flex-row'>
                    <p className='font-inter text-slate-500 mx-1 whitespace-nowrap'>{label}</p>
                    {link && <Link href={link} target='_blank' className='w-5'>
                        <ArrowTopRightOnSquareIcon className='h-5 w-5 flex-none icon-hover' aria-hidden='true' />
                    </Link>}
                </div>
            </div>
        </div>
    );
}
