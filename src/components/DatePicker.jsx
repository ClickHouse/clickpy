'use client';
import { DatePicker as ClickDatePicker } from '@clickhouse/click-ui';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { parseDate } from '@/utils/utils';

const MIN_CALENDAR_DATE = '1970-01-01';
const DATE_NAV_DEBOUNCE_MS = 600;

function todayString() {
  return formatLocalDate(new Date());
}

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

function startOfDayTime(dateString) {
  const date = toLocalDate(dateString);
  return date ? date.getTime() : undefined;
}

function ClearLogo({ clearable }) {
  return (
    <svg
      width='24'
      height='24'
      viewBox='0 0 24 24'
      fill='none'
      xmlns='http://www.w3.org/2000/svg'
      aria-hidden='true'
      className='block shrink-0'>
      <path
        d='M15.3975 9.3975L12.795 12L15.3975 14.6025C15.4528 14.654 15.4971 14.7161 15.5278 14.7851C15.5586 14.8541 15.5751 14.9286 15.5764 15.0041C15.5778 15.0796 15.5639 15.1547 15.5356 15.2247C15.5073 15.2947 15.4652 15.3584 15.4118 15.4118C15.3584 15.4652 15.2947 15.5073 15.2247 15.5356C15.1547 15.5639 15.0796 15.5778 15.0041 15.5764C14.9286 15.5751 14.8541 15.5586 14.7851 15.5278C14.7161 15.4971 14.654 15.4528 14.6025 15.3975L12 12.795L9.3975 15.3975C9.29087 15.4969 9.14984 15.551 9.00411 15.5484C8.85839 15.5458 8.71935 15.4868 8.61629 15.3837C8.51323 15.2807 8.45419 15.1416 8.45162 14.9959C8.44905 14.8502 8.50314 14.7091 8.6025 14.6025L11.205 12L8.6025 9.3975C8.50314 9.29087 8.44905 9.14983 8.45162 9.00411C8.45419 8.85838 8.51323 8.71934 8.61629 8.61628C8.71935 8.51322 8.85839 8.45419 9.00411 8.45162C9.14984 8.44905 9.29087 8.50314 9.3975 8.6025L12 11.205L14.6025 8.6025C14.7091 8.50314 14.8502 8.44905 14.9959 8.45162C15.1416 8.45419 15.2807 8.51322 15.3837 8.61628C15.4868 8.71934 15.5458 8.85838 15.5484 9.00411C15.551 9.14983 15.4969 9.29087 15.3975 9.3975ZM21.5625 12C21.5625 13.8913 21.0017 15.7401 19.9509 17.3126C18.9002 18.8852 17.4067 20.1108 15.6594 20.8346C13.9121 21.5584 11.9894 21.7477 10.1345 21.3788C8.27951 21.0098 6.57564 20.099 5.2383 18.7617C3.90096 17.4244 2.99022 15.7205 2.62125 13.8656C2.25227 12.0106 2.44164 10.0879 3.16541 8.34059C3.88917 6.59327 5.11482 5.09981 6.68736 4.04907C8.25991 2.99833 10.1087 2.4375 12 2.4375C14.5352 2.44048 16.9658 3.44891 18.7584 5.24158C20.5511 7.03425 21.5595 9.46478 21.5625 12ZM20.4375 12C20.4375 10.3312 19.9427 8.69992 19.0155 7.31238C18.0884 5.92484 16.7706 4.84338 15.2289 4.20477C13.6871 3.56615 11.9906 3.39906 10.3539 3.72462C8.71722 4.05019 7.2138 4.85378 6.03379 6.03379C4.85379 7.21379 4.05019 8.71721 3.72463 10.3539C3.39907 11.9906 3.56616 13.6871 4.20477 15.2289C4.84338 16.7706 5.92484 18.0884 7.31238 19.0155C8.69992 19.9426 10.3312 20.4375 12 20.4375C14.237 20.435 16.3817 19.5453 17.9635 17.9635C19.5453 16.3817 20.435 14.237 20.4375 12Z'
        fill={clearable ? '#FDFF88' : '#535353'}
      />
    </svg>
  );
}

function DateInput({ value, onCommit, ariaLabel, onOpenCalendar }) {
  const [draft, setDraft] = useState(value ?? '');

  useEffect(() => {
    setDraft(value ?? '');
  }, [value]);

  const commitValue = (raw) => {
    const parsed = parseDate(raw, undefined);
    if (!parsed) {
      setDraft(value ?? '');
      return;
    }
    setDraft(parsed);
    if (parsed !== value) {
      onCommit(parsed);
    }
  };

  return (
    <input
      aria-label={ariaLabel}
      value={draft}
      onChange={(e) => {
        const next = e.target.value;
        setDraft(next);
        if (next.length === 10) {
          const parsed = parseDate(next, undefined);
          if (parsed && parsed !== value) {
            onCommit(parsed);
          }
        }
      }}
      onClick={onOpenCalendar}
      onBlur={(e) => commitValue(e.target.value)}
      onKeyDown={(e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          commitValue(e.currentTarget.value);
          e.currentTarget.blur();
        }
      }}
      placeholder='YYYY-MM-DD'
      size={10}
      maxLength={10}
      spellCheck={false}
      className='bg-transparent text-neutral-0 text-sm font-normal outline-none w-[6.75rem] p-0 border-0 focus:ring-0 leading-5 cursor-pointer'
    />
  );
}

function DateField({ date, value, onSelect, placeholder, title, ariaLabel, allowFrom, allowTo, showIcon = true }) {
  const triggerWrapRef = useRef(null);

  useEffect(() => {
    const minTime = startOfDayTime(allowFrom) ?? Number.NEGATIVE_INFINITY;
    const maxTime = startOfDayTime(allowTo) ?? Number.POSITIVE_INFINITY;

    const apply = () => {
      const trigger = triggerWrapRef.current?.querySelector('button');
      if (trigger?.getAttribute('data-state') !== 'open') {
        return;
      }
      const root = document.querySelector('[data-testid="datepicker-calendar-container"]');
      if (!root) {
        return;
      }
      root.querySelectorAll('[role="gridcell"]').forEach((cell) => {
        const label = cell.getAttribute('aria-label');
        const time = label ? Date.parse(label) : Number.NaN;
        const outOfRange = Number.isNaN(time) || time < minTime || time > maxTime;
        cell.toggleAttribute('data-out-of-range', outOfRange);
      });
    };

    const blockOutOfRange = (event) => {
      const cell = event.target.closest?.('[role="gridcell"][data-out-of-range]');
      if (!cell) {
        return;
      }
      event.preventDefault();
      event.stopPropagation();
    };

    const observer = new MutationObserver(apply);
    observer.observe(document.body, { childList: true, subtree: true });
    document.addEventListener('click', blockOutOfRange, true);
    document.addEventListener('keydown', blockOutOfRange, true);
    apply();

    return () => {
      observer.disconnect();
      document.removeEventListener('click', blockOutOfRange, true);
      document.removeEventListener('keydown', blockOutOfRange, true);
    };
  }, [allowFrom, allowTo]);

  const openCalendar = () => {
    const trigger = triggerWrapRef.current?.querySelector('button');
    if (!trigger) {
      return;
    }
    if (trigger.getAttribute('data-state') === 'open' || trigger.getAttribute('aria-expanded') === 'true') {
      return;
    }
    trigger.click();
  };

  return (
    <div className='relative flex items-center min-w-0'>
      <div
        ref={triggerWrapRef}
        className={
          showIcon
            ? 'date-picker-icon-only relative w-6 h-6 shrink-0 mr-1'
            : 'date-picker-icon-only absolute left-0 top-1/2 -translate-y-1/2 w-px h-px overflow-hidden'
        }
        title={showIcon ? title : undefined}>
        <ClickDatePicker
          date={date}
          onSelectDate={(selected) => {
            const formatted = formatLocalDate(selected);
            if (formatted) {
              onSelect(formatted);
            }
          }}
          futureDatesDisabled
          placeholder={placeholder}
        />
      </div>
      <DateInput
        value={value}
        onCommit={onSelect}
        ariaLabel={ariaLabel}
        onOpenCalendar={openCalendar}
      />
    </div>
  );
}

export default function DatePicker({ dates }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const current = new URLSearchParams(searchParams.toString());
  const urlFrom = current.get('min_date') || dates?.[0];
  const urlTo = current.get('max_date') || dates?.[1];
  const [fromValue, setFromValue] = useState(urlFrom);
  const [toValue, setToValue] = useState(urlTo);
  const clearable =
    current.get('min_date') ||
    current.get('max_date') ||
    fromValue !== urlFrom ||
    toValue !== urlTo;
  const startDate = toLocalDate(fromValue);
  const endDate = toLocalDate(toValue);
  const navTimerRef = useRef(null);

  useEffect(() => {
    setFromValue(urlFrom);
    setToValue(urlTo);
  }, [urlFrom, urlTo]);

  useEffect(() => {
    return () => {
      if (navTimerRef.current) {
        clearTimeout(navTimerRef.current);
      }
    };
  }, []);

  const pushParams = (params, { immediate = false } = {}) => {
    const query = params.toString();
    const href = query ? `${pathname}?${query}` : pathname;
    const navigate = () => {
      navTimerRef.current = null;
      router.push(href, { scroll: false });
    };
    if (navTimerRef.current) {
      clearTimeout(navTimerRef.current);
      navTimerRef.current = null;
    }
    if (immediate) {
      navigate();
      return;
    }
    navTimerRef.current = setTimeout(navigate, DATE_NAV_DEBOUNCE_MS);
  };

  const setRange = (nextFrom, nextTo, options) => {
    const start = parseDate(nextFrom, undefined);
    const end = parseDate(nextTo, undefined);
    if (!start || !end) {
      return;
    }
    setFromValue(start);
    setToValue(end);
    const params = new URLSearchParams(searchParams.toString());
    params.set('min_date', start);
    params.set('max_date', end);
    pushParams(params, options);
  };

  const setStartDate = (formatted) => {
    const start = parseDate(formatted, undefined);
    if (!start) {
      return;
    }
    const end = toValue && start > toValue ? start : toValue;
    setRange(start, end);
  };

  const setEndDate = (formatted) => {
    const end = parseDate(formatted, undefined);
    if (!end) {
      return;
    }
    const start = fromValue && end < fromValue ? end : fromValue;
    setRange(start, end);
  };

  useEffect(() => {
    if (fromValue && toValue && fromValue > toValue) {
      setRange(toValue, fromValue, { immediate: true });
    }
  }, [fromValue, toValue]);

  const clearDates = () => {
    if (!clearable) {
      return;
    }
    current.delete('min_date');
    current.delete('max_date');
    pushParams(current, { immediate: true });
  };

  return (
    <div className='w-max relative min-h-[50px] overflow-visible'>
      {clearable && (
        <span className='absolute -top-1 -right-1 flex h-3 w-3 z-10'>
          <span className='animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-400 opacity-75'></span>
          <span className='relative inline-flex rounded-full h-3 w-3 bg-primary-500'></span>
        </span>
      )}
      <div
        className={`flex items-center bg-neutral-725 leading-5 rounded-md border box-border text-sm font-normal border-slate-700 pl-3 pr-2 w-full h-[50px] overflow-visible ${
          clearable ? 'border-primary-300 ring-1 ring-primary-300' : ''
        }`}>
        <DateField
          date={startDate}
          value={fromValue}
          onSelect={setStartDate}
          placeholder='Start date'
          title='Open start date calendar'
          ariaLabel='From date'
          allowFrom={MIN_CALENDAR_DATE}
          allowTo={toValue}
        />
        <span className='text-slate-400 font-bold mx-1'>to</span>
        <DateField
          date={endDate}
          value={toValue}
          onSelect={setEndDate}
          placeholder='End date'
          title='Open end date calendar'
          ariaLabel='To date'
          allowFrom={fromValue}
          allowTo={todayString()}
          showIcon={false}
        />
        <button
          type='button'
          onClick={clearDates}
          aria-label='Clear dates'
          disabled={!clearable}
          className={`ml-2 shrink-0 flex items-center justify-center h-6 w-6 p-0 leading-none overflow-visible ${
            clearable ? 'cursor-pointer' : 'cursor-default'
          }`}>
          <ClearLogo clearable={clearable} />
        </button>
      </div>
    </div>
  );
}
