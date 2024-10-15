'use client'
import { Text, Link } from '@clickhouse/click-ui';

export default function PlaygroundLink({package_name}) {
  return (
    <div className='flex flex-row items-end justify-items-end'>
        <Text>Can't find the visual you need? <Link href={`https://clickpy-playground.clickhouse.com?query=U0VMRUNUCiAgICB0b1N0YXJ0T2ZXZWVrKGRhdGUpOjpEYXRlMzIgQVMgd2VlaywKICAgIHN1bShjb3VudCkgQVMgZG93bmxvYWRzCkZST00gcHlwaS5weXBpX2Rvd25sb2Fkc19wZXJfZGF5IApXSEVSRSAocHJvamVjdCA9IHtwYWNrYWdlX25hbWU6U3RyaW5nfSkgCkdST1VQIEJZIHdlZWsKT1JERVIgQlkgd2VlayBBU0M&chart=eyJ0eXBlIjoibGluZSIsImNvbmZpZyI6eyJ4YXhpcyI6IndlZWsiLCJ5YXhpcyI6ImRvd25sb2FkcyJ9fQ&param_package_name=${package_name}&run_query=true&tab=charts`} target='_blank'>Build your own here</Link></Text> 
    </div>
  )
}
