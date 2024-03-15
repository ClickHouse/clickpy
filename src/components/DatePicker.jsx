'use client';
import DateRangePicker from '@gingerwizard/react-daterange-picker';
import '@gingerwizard/react-daterange-picker/dist/DateRangePicker.css';
import 'react-calendar/dist/Calendar.css';
import './datepicker.css';
import Image from 'next/image';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

function ClearLogo(clearable) {
  return (
    <svg
      width='24'
      height='24'
      viewBox='0 0 24 24'
      fill='none'
      xmlns='http://www.w3.org/2000/svg'>
      <path
        d='M15.3975 9.3975L12.795 12L15.3975 14.6025C15.4528 14.654 15.4971 14.7161 15.5278 14.7851C15.5586 14.8541 15.5751 14.9286 15.5764 15.0041C15.5778 15.0796 15.5639 15.1547 15.5356 15.2247C15.5073 15.2947 15.4652 15.3584 15.4118 15.4118C15.3584 15.4652 15.2947 15.5073 15.2247
            15.5356C15.1547 15.5639 15.0796 15.5778 15.0041 15.5764C14.9286 15.5751 14.8541 15.5586 14.7851 15.5278C14.7161 15.4971 14.654 15.4528 14.6025 15.3975L12 12.795L9.3975 15.3975C9.29087 15.4969 9.14984 15.551 9.00411 15.5484C8.85839 15.5458 8.71935 15.4868 8.61629 15.3837C8.51323 15.2807
            8.45419 15.1416 8.45162 14.9959C8.44905 14.8502 8.50314 14.7091 8.6025 14.6025L11.205 12L8.6025 9.3975C8.50314 9.29087 8.44905 9.14983 8.45162 9.00411C8.45419 8.85838 8.51323 8.71934 8.61629 8.61628C8.71935 8.51322 8.85839 8.45419 9.00411 8.45162C9.14984 8.44905 9.29087 8.50314 9.3975
            8.6025L12 11.205L14.6025 8.6025C14.7091 8.50314 14.8502 8.44905 14.9959 8.45162C15.1416 8.45419 15.2807 8.51322 15.3837 8.61628C15.4868 8.71934 15.5458 8.85838 15.5484 9.00411C15.551 9.14983 15.4969 9.29087 15.3975 9.3975ZM21.5625 12C21.5625 13.8913 21.0017 15.7401 19.9509 17.3126C18.9002
            18.8852 17.4067 20.1108 15.6594 20.8346C13.9121 21.5584 11.9894 21.7477 10.1345 21.3788C8.27951 21.0098 6.57564 20.099 5.2383 18.7617C3.90096 17.4244 2.99022 15.7205 2.62125 13.8656C2.25227 12.0106 2.44164 10.0879 3.16541 8.34059C3.88917 6.59327 5.11482 5.09981 6.68736 4.04907C8.25991
            2.99833 10.1087 2.4375 12 2.4375C14.5352 2.44048 16.9658 3.44891 18.7584 5.24158C20.5511 7.03425 21.5595 9.46478 21.5625 12ZM20.4375 12C20.4375 10.3312 19.9427 8.69992 19.0155 7.31238C18.0884 5.92484 16.7706 4.84338 15.2289 4.20477C13.6871 3.56615 11.9906 3.39906 10.3539 3.72462C8.71722
            4.05019 7.2138 4.85378 6.03379 6.03379C4.85379 7.21379 4.05019 8.71721 3.72463 10.3539C3.39907 11.9906 3.56616 13.6871 4.20477 15.2289C4.84338 16.7706 5.92484 18.0884 7.31238 19.0155C8.69992 19.9426 10.3312 20.4375 12 20.4375C14.237 20.435 16.3817 19.5453 17.9635 17.9635C19.5453 16.3817
            20.435 14.237 20.4375 12Z'
        fill={clearable ? '#FDFF88' : '#9A9EA7'}
        cursor={clearable ? 'pointer' : 'default'}
      />
    </svg>
  );
}

export default function DatePicker({ dates }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const current = new URLSearchParams(searchParams.toString());
  const clearable = current.get('min_date') || current.get('max_date');
  const onChange = (min_date, max_date) => {
    min_date ? current.set('min_date', min_date) : current.delete('min_date');
    max_date ? current.set('max_date', max_date) : current.delete('max_date');
    router.push(`${pathname}?${current.toString()}`, { scroll: false });
  };

  const onSelectDates = (values) => {
    values
      ? onChange(
        `${values[0].getFullYear()}-${(values[0].getMonth() + 1).toString().padStart(2, '0')}-${values[0].getDate().toString().padStart(2, '0')}`,
        `${values[1].getFullYear()}-${(values[1].getMonth() + 1).toString().padStart(2, '0')}-${values[1].getDate().toString().padStart(2, '0')}`
        )
      : onChange();
  };

  return (
    <div className='width-[320px] max-w-[360px] min-w-[320px]'>
      <Suspense>
        <DateRangePicker
          format='y-MM-dd'
          showLeadingZeros={true}
          calendarClassName='calendar'
          className='date_picker'
          onChange={onSelectDates}
          rangeDivider={' to '}
          calendarIcon={
            <Image alt='calendar' src='/calendar.svg' width={16} height={16} />
          }
          value={dates}
          clearIcon={ClearLogo(clearable)}
        />
      </Suspense>
    </div>
  );
}
