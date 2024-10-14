import {
    getDependencies,
    getDependents
} from '@/utils/clickhouse';
import DependencyTableClient from './DependencyTableClient';

export default async function DependencyTable({ params }) {
    const [dependencies, dependents] = await Promise.all([getDependencies(params), getDependents(params)]);
    return (
        <DependencyTableClient dependencies={dependencies} dependents={dependents}/>
    );
}