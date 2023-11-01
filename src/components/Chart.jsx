import React, { Suspense } from 'react'
import Loading from './Loading'
import Charts from './Charts'

export default async function Chart ({getData, type, params, options}) {
    const data = await getData(params)
    return (<Charts type={type} data={data} options={options}/>)
}
