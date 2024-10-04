import { ClickUIProvider, Table as ClickTable } from '@clickhouse/click-ui'
import {
    getDependencies
  } from '@/utils/clickhouse';
export default async function DependencyTable({ params }) {
    const [data, link] = await getDependencies(params);
    const headers = data.length > 0 ? Object.keys(data[0]).map(key => ({
        label: key.charAt(0).toUpperCase() + key.slice(1)
    })) : [];
    const rows = data.map((row, index) => ({
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