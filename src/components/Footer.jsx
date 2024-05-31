
export default function Footer() {
  return (
    <div className='flex xl:justify-between w-full flex-col xl:flex-row items-center gap-2 xl:gap-0'>
        <div>
            <span className='text-sm text-neutral-500'>© 2024 ClickHouse, Inc. HQ in the Bay Area, CA and Amsterdam, NL.</span>
        </div>
        <div className='flex gap-2 sm:gap-4 md:gap-8'>
            <a className='text-sm text-neutral-500 hover:text-primary-300 hover:underline' href='https://clickhouse.com/legal/trademark-policy' target='_blank'>Trademark</a>
            <a className='text-sm text-neutral-500 hover:text-primary-300 hover:underline' href='https://clickhouse.com/legal/privacy-policy' target='_blank'>Privacy</a>
            <a className='text-sm text-neutral-500 hover:text-primary-300 hover:underline' href='https://trust.clickhouse.com/' target='_blank'>Security</a>
            <a className='text-sm text-neutral-500 hover:text-primary-300 hover:underline' href='https://clickhouse.com/legal/agreements/terms-of-service' target='_blank'>Terms of Service</a>
            <a className='text-sm text-neutral-500 hover:text-primary-300 hover:underline' href='https://clickhouse.com/legal/cookie-policy' target='_blank'>Cookie Policy</a>
        </div>
    </div>
  );
}
