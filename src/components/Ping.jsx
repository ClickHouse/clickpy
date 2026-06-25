'use client';

import { ping } from '@/utils/clickhouse';
import { useEffect } from 'react';
import { useGalaxyOnPage } from '@/lib/galaxy/galaxy';

const Ping = ({name}) => {
    useEffect(() => {
        ping(name)
    }, [name]);

    useGalaxyOnPage(name);

    return null;
}

export default Ping;
