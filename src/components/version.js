export default function Version({current, latest}) {
    return (
        <div className="rounded-lg col-span-1 bg-slate-850 items-center gap-4 flex p-4 h-24 w-full">
            <img className="h-16 w-16 min-w-16 min-h-16" src="/version.svg" alt="Version"/>
            <div className="ml-2 mr-4">
                <p className="text-xl mr-2 font-bold">{current}</p>
                <p className="text-slate-200">version</p>
            </div>
            <div>
                <p className="text-xl mr-2 font-bold">{latest}</p>
                <p className="text-slate-200 text-sm">latest version</p>
            </div>
        </div>
    )
}