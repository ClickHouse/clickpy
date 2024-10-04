'use client';
import { ClickUIProvider, Table as ClickTable } from '@clickhouse/click-ui'

export default async function DependencyTableClient({ dependencies,  dependents}) {
    const headers = dependencies[1].length > 0 ? Object.keys(dependencies[1][0]).map(key => ({
        label: key.charAt(0).toUpperCase() + key.slice(1)
    })) : [];
    const rows = dependencies[1].map((row, index) => ({
        id: `row-${index + 1}`,
        items: Object.values(row).map(value => ({
            label: value.toString()
        }))
    }));

    return (
        <div>
            <ClickUIProvider theme={'dark'}>
                <ClickTable
                    headers={headers}
                    onSelect={() => {}}
                    onSort={() => {}}
                    rows={rows}
                />
            </ClickUIProvider>
        </div>
    );
}