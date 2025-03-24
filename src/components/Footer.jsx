
export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <div className='flex xl:justify-between w-full flex-col xl:flex-row items-center gap-2 xl:gap-0'>
        <div className="text-center">
            <span className='text-sm text-neutral-500 text-center'>© {year} ClickHouse, Inc. HQ in the Bay Area, CA and Amsterdam, NL.</span>
        </div>
        <div className='flex gap-2 sm:gap-4 md:gap-8'>
            <a className='text-xs md:text-sm text-neutral-500 hover:text-primary-300 hover:underline' href='https://clickhouse.com/legal/trademark-policy' target='_blank'>Trademark</a>
            <a className='text-xs md:text-sm text-neutral-500 hover:text-primary-300 hover:underline' href='https://clickhouse.com/legal/privacy-policy' target='_blank'>Privacy</a>
            <a className='text-xs md:text-sm text-neutral-500 hover:text-primary-300 hover:underline' href='https://trust.clickhouse.com/' target='_blank'>Security</a>
            <a className='text-xs md:text-sm text-neutral-500 hover:text-primary-300 hover:underline' href='https://clickhouse.com/legal/agreements/terms-of-service' target='_blank'>Terms of Service</a>
            <a className='text-xs md:text-sm text-neutral-500 hover:text-primary-300 hover:underline' href='https://clickhouse.com/legal/cookie-policy' target='_blank'>Cookie Policy</a>
            <button
              id='cookie-settings-button'
              className={
                'cmp-revoke-consent text-xs md:text-sm text-neutral-500 whitespace-nowrap bg-transparent hover:text-neutral-0'
              }>
              Cookie settings
        </button>
        </div>

    </div>
  );
}
