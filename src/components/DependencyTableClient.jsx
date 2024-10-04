'use client';
import { ClickUIProvider, Tabs, Table as ClickTable } from '@clickhouse/click-ui'

export default async function DependencyTableClient({ dependencies,  dependents}) {
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
                <Tabs ariaLabel="dependencies and dependents" defaultValue="dependencies" className="h-full flex flex-col">
                    <Tabs.TriggersList style={{"border": 0 }}>
                        <Tabs.Trigger value="dependencies" key="dependencies">
                            Dependencies
                        </Tabs.Trigger>
                        <Tabs.Trigger value="dependents" key="dependents" className="py-4">
                            Dependents
                        </Tabs.Trigger>
                    </Tabs.TriggersList>

                    <Tabs.Content value="dependencies" className="h-full">
                        <ClickTable
                            headers={dependency_headers}
                            onSelect={() => {}}
                            onSort={() => {}}
                            rows={dependency_rows}
                        />
                    </Tabs.Content>
                    <Tabs.Content value="dependents" className="h-full">
                        <ClickTable
                            headers={dependents_headers}
                            onSelect={() => {}}
                            onSort={() => {}}
                            rows={dependents_rows}
                        />
                    </Tabs.Content>
                </Tabs>  
            </ClickUIProvider>
        </div>
    );
}