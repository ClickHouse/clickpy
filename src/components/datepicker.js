'use client'
import DateRangePicker from '@wojtekmaj/react-daterange-picker';
import '@wojtekmaj/react-daterange-picker/dist/DateRangePicker.css';
import 'react-calendar/dist/Calendar.css';
import './datepicker.css'
import { XMarkIcon } from '@heroicons/react/20/solid'

function DownLogo() {
    return (<svg width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M1.04751 1.76871C0.606539 1.32773 0.918855 0.57373 1.54249 0.57373H5.21313H8.88378C9.50741 0.57373 9.81973 1.32773 9.37876 1.76871L5.70811 5.43935C5.43474 5.71272 4.99153 5.71272 4.71816 5.43935L1.04751 1.76871Z" fill="white"/>
        </svg>
    )
}


export default function DatePicker({dates, onChange, clearable}) {

    const onSelectDates = (values) => {
        values ? onChange(values[0].toISOString().split('T')[0],values[1].toISOString().split('T')[0]) : onChange()
    }

    return (
        <div className="width-[280px] max-w-[280px]">
            <DateRangePicker showLeadingZeros={true} calendarClassName='calendar' className='date_picker' onChange={onSelectDates} rangeDivider={' to '} calendarIcon={<DownLogo/>} value={dates} clearIcon={clearable ? <XMarkIcon className="fill-white h-4 w-4" aria-hidden="true"/> : null }/>
        </div>
    )
}
