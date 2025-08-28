'use client'
import { Text, Link } from '@clickhouse/click-ui';

export default function PlaygroundLink({package_name}) {
  return (
    <div className='flex flex-row items-end justify-items-end'>
        <Text size='lg'>Can&apos;t find the visual you need? <Link size='lg' href={`${process.env.NEXT_PUBLIC_QUERY_LINK_HOST}?query=U0VMRUNUCiAgICB0b1N0YXJ0T2ZXZWVrKGRhdGUpOjpEYXRlMzIgQVMgd2VlaywKICAgIHN1bShjb3VudCkgQVMgZG93bmxvYWRzCkZST00gcnVieWdlbXMuZG93bmxvYWRzX3Blcl9kYXkgCldIRVJFIChnZW0gPSB7cGFja2FnZV9uYW1lOlN0cmluZ30pIApHUk9VUCBCWSB3ZWVrCk9SREVSIEJZIHdlZWsgQVND&chart=eyJ0eXBlIjoibGluZSIsImNvbmZpZyI6eyJ4YXhpcyI6IndlZWsiLCJ5YXhpcyI6ImRvd25sb2FkcyJ9fQ&param_package_name=${package_name}&run_query=true&tab=charts`} target='_blank'>Build your own here</Link></Text> 
    </div>
  )
}
