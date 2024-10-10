'use client';
import { ClickUIProvider, Tabs, Table as ClickTable, Link } from '@/click-ui';
import {
    ArrowTopRightOnSquareIcon,
} from '@heroicons/react/20/solid';
import { useState } from 'react';

export default function DependencyTableClient({ dependencies, dependents }) {
    const [isDependency, setIsDependency] = useState(true);

    const dependency_headers = dependencies[1].length > 0 ? Object.keys(dependencies[1][0]).map(key => ({
        label: key.charAt(0).toUpperCase() + key.slice(1)
    })) : [];
    const dependency_rows = dependencies[1].map((row, index) => ({
        id: `row-${index + 1}`,
        items: Object.values(row).map(value => ({
            label: value.toString()
        }))
    }));

    const dependents_headers = dependents[1].length > 0 ? Object.keys(dependents[1][0]).map(key => ({
        label: key.charAt(0).toUpperCase() + key.slice(1)
    })) : [];
    const dependents_rows = dependents[1].map((row, index) => ({
        id: `row-${index + 1}`,
        items: Object.values(row).map(value => ({
            label: value.toString()
        }))
    }));

    return (
        <div>
            <ClickUIProvider theme={'dark'}>
                <Tabs ariaLabel='dependencies and dependents' defaultValue='dependencies' className='h-full flex flex-col'>
                    <div className='flex justify-between'>
                        <Tabs.TriggersList style={{ 'border': 0 }} >
                            <Tabs.Trigger value='dependencies' key='dependencies' onClick={() => { setIsDependency(true); }}>
                                Dependencies
                            </Tabs.Trigger>
                            <Tabs.Trigger value='dependents' key='dependents' className='py-4' onClick={() => { setIsDependency(false); }}>
                                Dependents
                            </Tabs.Trigger>
                        </Tabs.TriggersList>
                        <Link href={isDependency ? dependencies[0] : dependents[0]} target='_blank' className='w-5 ml-5'>
                            <ArrowTopRightOnSquareIcon className='h-5 w-5 flex-none icon-hover' aria-hidden='true' />
                        </Link>
                    </div>
                    <Tabs.Content value='dependencies' className='h-full'>
                        <ClickTable
                            headers={dependency_headers}
                            onSelect={() => { }}
                            onSort={() => { }}
                            rows={dependency_rows}
                        />
                    </Tabs.Content>
                    <Tabs.Content value='dependents' className='h-full'>
                        <ClickTable
                            headers={dependents_headers}
                            onSelect={() => { }}
                            onSort={() => { }}
                            rows={dependents_rows}
                        />
                    </Tabs.Content>
                </Tabs>
            </ClickUIProvider>
        </div>
    );
}
