import { ArrowTopRightOnSquareIcon } from '@heroicons/react/20/solid'

export default function Package({packageDetails}) {
    return (
        <div>
            <div className="flex items-center text-center">
                <p className="text-4xl font-bold mr-5">{packageDetails.name}</p>
                <a href={packageDetails.home_page} target="_blank" className="text-center pt-1">
                    <button type="button"><ArrowTopRightOnSquareIcon className={`h-4 w-4 fill-white`} aria-hidden="true" /></button>
                </a>
            </div>
            {
                <div className="mt-5 leading-6 tracking-wide text-slate-200">
                    <p>Author: {packageDetails.author}</p>
                    <p>Author Email: {packageDetails.author_email}</p>
                    <p>License: {packageDetails.license}</p>
                    <p>Summary: {packageDetails.summary}</p>
                </div>
            }
            
        </div>
    )
}