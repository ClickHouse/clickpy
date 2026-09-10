'use client';
import { DatePicker as ClickDatePicker } from '@clickhouse/click-ui';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { parseDate } from '@/utils/utils';

function toLocalDate(dateString) {
  const parsed = parseDate(dateString, undefined);
  if (!parsed) {
    return undefined;
  }
  const [year, month, day] = parsed.split('-').map(Number);
  return new Date(year, month - 1, day);
}

function formatLocalDate(date) {
  if (!(date instanceof Date) || Number.isNaN(date.getTime())) {
    return undefined;
  }
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

export default function DatePicker({ dates }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const current = new URLSearchParams(searchParams.toString());
  const clearable = current.get('min_date') || current.get('max_date');
  const startDate = toLocalDate(dates?.[0]);
  const endDate = toLocalDate(dates?.[1]);

  const pushParams = (params) => {
    const query = params.toString();
    router.push(query ? `${pathname}?${query}` : pathname, { scroll: false });
  };

  const onSelectFrom = (date) => {
    const formatted = formatLocalDate(date);
    if (!parseDate(formatted, undefined)) {
      return;
    }
    current.set('min_date', formatted);
    pushParams(current);
  };

  const onSelectTo = (date) => {
    const formatted = formatLocalDate(date);
    if (!parseDate(formatted, undefined)) {
      return;
    }
    current.set('max_date', formatted);
    pushParams(current);
  };

  const clearDates = () => {
    current.delete('min_date');
    current.delete('max_date');
    pushParams(current);
  };

  return (
    <div className='flex flex-row flex-wrap gap-2 items-center relative'>
      {clearable && (
        <span className='absolute -top-1 -right-1 flex h-3 w-3 z-10'>
          <span className='animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-400 opacity-75'></span>
          <span className='relative inline-flex rounded-full h-3 w-3 bg-primary-500'></span>
        </span>
      )}
      <ClickDatePicker
        date={startDate}
        onSelectDate={onSelectFrom}
        placeholder='From'
        futureDatesDisabled
      />
      <span className='text-sm text-neutral-400'>to</span>
      <ClickDatePicker
        date={endDate}
        onSelectDate={onSelectTo}
        placeholder='To'
        futureDatesDisabled
      />
      {clearable && (
        <button
          type='button'
          onClick={clearDates}
          aria-label='Clear dates'
          className='text-neutral-400 hover:text-primary-300 p-1'>
          <svg width='16' height='16' viewBox='0 0 24 24' fill='none' aria-hidden='true'>
            <path
              d='M6 6l12 12M18 6L6 18'
              stroke='currentColor'
              strokeWidth='2'
              strokeLinecap='round'
            />
          </svg>
        </button>
      )}
    </div>
  );
}
