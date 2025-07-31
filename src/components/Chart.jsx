import React, { Suspense } from 'react'
import Charts from './Charts'

export default async function Chart ({getData, type, params, options}) {
    console.log(type)
    const [link, data] = await getData(params)
    return (<Charts type={type} data={data} options={options} link={link}/>)
}
