'use client';
import { ClickUIProvider, Tabs, Table as ClickTable, Link } from '@clickhouse/click-ui';
import {
    ArrowTopRightOnSquareIcon,
  } from '@heroicons/react/20/solid';
import { useState, useEffect } from 'react';
import { formatNumber } from '@/utils/utils';

export default function DependencyTableClient({ dependencies,  dependents}) {
    
    const [isDependency, setIsDependency] = useState(false);
    const [rowHeight, setRowHeight] = useState('auto');

    const [order, setOrder] = useState({column: 'downloads', order: 'desc'});

    const updateRowHeight = () => {
        if (window.innerWidth > 1024) {
            setRowHeight('45px');
        } else {
            setRowHeight('auto');
        }
    };

    useEffect(() => {
        updateRowHeight();
        window.addEventListener('resize', updateRowHeight);
        return () => {
            window.removeEventListener('resize', updateRowHeight);
        };
    }, []);

    const dependency_headers = dependencies[1].length > 0 ? Object.keys(dependencies[1][0]).map((key) => (
        (key === "package") ?  {label: key.charAt(0).toUpperCase() + key.slice(1), width: '40%'} :
        {label: key.charAt(0).toUpperCase() + key.slice(1), isSortable: true, sortDir: key === order.column && order.order} 
    )) : [];
    
    const dependency_rows = dependencies[1].sort((a, b) => {
        return order.order === 'desc' ? Number(b[order.column]) - Number(a[order.column]) : Number(a[order.column]) - Number(b[order.column]);
    }).map((row, index) => ({
        id: `row-${index + 1}`,
        items: Object.keys(row).map(key => ({
            label: key === 'package' 
                ? <Link target='_blank' href={`/dashboard/${row[key].toString()}`}>{row[key].toString()}</Link> 
                : (!isNaN(parseFloat(row[key])) && isFinite(row[key]) ? formatNumber(Number(row[key])) : row[key])
        }))
    }));

    const dependents_headers = dependents[1].length > 0 ? Object.keys(dependents[1][0]).map((key, i) => (
        (key === 'package') ?  {label: key.charAt(0).toUpperCase() + key.slice(1), width: '40%'} :
        {label: key.charAt(0).toUpperCase() + key.slice(1), isSortable: true, sortDir: key === order.column && order.order } 
    )) : [];

    const dependents_rows = dependents[1].sort((a, b) => {
        return order.order === 'desc' ? Number(b[order.column]) - Number(a[order.column]) : Number(a[order.column]) - Number(b[order.column]);
    }).map((row, index) => ({
        id: `row-${index + 1}`,
        items: Object.keys(row).map(key => ({
            label: key === 'package' 
                ? <Link target='_blank' href={`/dashboard/${row[key].toString()}`}>{row[key].toString()}</Link> 
                : (!isNaN(parseFloat(row[key])) && isFinite(row[key]) ? formatNumber(Number(row[key])) : row[key])
        }))
    }));


    return (
        <div>
            <ClickUIProvider theme={'dark'}>
                <Tabs ariaLabel='dependencies and dependents' defaultValue='dependents' className='h-full flex flex-col'>
                    <div className='flex justify-between'>
                        <Tabs.TriggersList style={{'border': 0 }} >
                            <Tabs.Trigger value='dependents' key='dependents' className='py-4' onClick={()=>{setIsDependency(false);}}>
                                Dependents
                            </Tabs.Trigger>
                            <Tabs.Trigger value='dependencies' key='dependencies' onClick={()=>{setIsDependency(true);}}>
                                Dependencies
                            </Tabs.Trigger>
                        </Tabs.TriggersList>
                        <Link href={isDependency ? dependencies[0]: dependents[0]} target='_blank' className='w-5 ml-5'>
                            <ArrowTopRightOnSquareIcon className='h-5 w-5 flex-none icon-hover' aria-hidden='true'/>
                        </Link>
                    </div>
                    <Tabs.Content value='dependents' className='h-full'>
                        <ClickTable
                            headers={dependents_headers}
                            onSort={(sortDir, header, index) => { setOrder({column: header.label.toLowerCase(), order: sortDir})}}
                            rows={dependents_rows}
                            size='sm'
                            noDataMessage='No dependents'
                            rowHeight={rowHeight}
                        />
                    </Tabs.Content>
                    <Tabs.Content value='dependencies' className='h-full'>
                        <ClickTable
                            headers={dependency_headers}
                            onSort={(sortDir, header, index) => { setOrder({column: header.label.toLowerCase(), order: sortDir})}}
                            rows={dependency_rows}
                            size='sm'
                            noDataMessage='No dependencies'
                            rowHeight={rowHeight}
                        />
                    </Tabs.Content>
                </Tabs>  
            </ClickUIProvider>
        </div>
    );
}
