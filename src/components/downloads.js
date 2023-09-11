export default function Downloads({total, last_day, last_week, last_month}) {
    return (
        <div className='rounded-lg bg-slate-850 flex items-center gap-8 lg:justify-between p-4 h-24 border border-slate-700 rounded-l'>
            <div className='h-16 w-16 flex gap-4'>
                <img className='h-16 w-16 min-w-[64px] min-h-16' src='/download.svg' alt='Download'/>
                <div className='hidden 2xl:flex flex-col'>
                    <p className='text-xl font-bold'>Downloads</p>
                    <p className='text-slate-200'>by period</p>
                </div>
            </div>
            <div className='justify-items-end flex flex-row mr-4 gap-4'>
                <div className='hidden xl:block'>
                    <p className='text-xl mr-2 font-bold'>{Number(last_day).toLocaleString('en-US')}</p>
                    <p className='text-slate-200 text-center'>last day</p>
                </div>
                <div className='hidden lg:block'>
                    <p className='text-xl mr-2 font-bold'>{Number(last_week).toLocaleString('en-US')}</p>
                    <p className='text-slate-200 text-center'>last week</p>
                </div>
                <div className='hidden lg:block'>
                    <p className='text-xl mr-2 font-bold'>{Number(last_month).toLocaleString('en-US')}</p>
                    <p className='text-slate-200 text-center'>last month</p>
                </div>
                <div>
                    <p className='text-xl mr-2 font-bold'>{Number(total).toLocaleString('en-US')}</p>
                    <p className='text-slate-200 text-center'>total</p>
                </div>
            </div>
        </div>
    )
  }
  