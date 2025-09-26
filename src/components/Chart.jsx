import React, { Suspense } from 'react'
import Charts from './Charts'
import { getMetabaseLink } from '@/utils/metabase'

export default async function Chart ({getData, type, name, params, options}) {
    const [link, data] = await getData(params)
    const packageName = params?.package_name
    const metabaseLink = getMetabaseLink(name, packageName)
    return (<Charts type={type} data={data} options={options} link={link} metabaseLink={metabaseLink} />)
}
