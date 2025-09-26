import {
    getDependencies,
    getDependents
} from '@/utils/clickhouse';
import DependencyTableClient from './DependencyTableClient';
import { getMetabaseLink } from '@/utils/metabase';

export default async function DependencyTable({ params }) {
    const [dependencies, dependents] = await Promise.all([getDependencies(params), getDependents(params)]); 
    const packageName = params?.package_name
    const getDependentsMetabaseLink = getMetabaseLink('getDependents', packageName)
    const getDependenciesMetabaseLink = getMetabaseLink('getDependencies', packageName)
    dependents.push(getDependentsMetabaseLink)
    dependencies.push(getDependenciesMetabaseLink)
    return (
        <DependencyTableClient dependencies={dependencies} dependents={dependents}/>
    );
}
