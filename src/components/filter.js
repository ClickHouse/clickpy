import { XMarkIcon } from '@heroicons/react/20/solid'


export default function Filter({value, name, onRemove}) {

    return (
        value &&
        <span className="inline-flex items-center gap-2 rounded-xl bg-chart px-2 py-2 text font-medium text-white border border-slate-500 h-[40px] pr-4">
            {`${name}: ${value}`}
            <button onClick={() => onRemove && onRemove()} type="button" className="group relative -mr-1 h-3.5 w-3.5 rounded-sm hover:bg-slate-400">
            <span className="sr-only">Remove</span>
            <XMarkIcon className="h-4 w-4"/>
            <span className="absolute -inset-1" />
            </button>
        </span>
    )
}