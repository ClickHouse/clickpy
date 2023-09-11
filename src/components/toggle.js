'use client'
import { queryEngines } from '@/utils/query'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'

export default function QueryToggle() {

    const router = useRouter()
    const searchParams = useSearchParams()
    const pathname = usePathname()
    
    let selected = queryEngines[0]
    if (searchParams.has('engine')) {
        let match = queryEngines.find(engine => (searchParams.get('engine') == engine.value))
        if (match) {
            selected = match
        }
    }

    const onClick = (option) => {
        const current = new URLSearchParams(searchParams.toString())
        current.set('engine', option.value)
        router.push(`${pathname}?${current.toString()}`, { scroll: false })
    }

    return (
        <div>
            <span className='isolate inline-flex rounded-md shadow-sm h-full'>
                {
                    queryEngines.map((option, i) => {
                        return (
                            <button key={option.value} onClick={ ()=> onClick(option) } type='button' className={`${i === 0 ? 'rounded-l-lg': (i == queryEngines.length -1) ? 'rounded-r-lg': ''} ${option.value == selected.value ? 'bg-primary-300 cursor-default': 'bg-white hover:bg-gray-50'} relative inline-flex items-center px-3 py-2.5 text-sm text-gray-900 ring-1 ring-inset ring-gray-300 focus:z-10`}>
                                {option.label}
                            </button>
                        )
                    })
                }
            </span>
        </div>
  )
}
