'use client';

import { ping } from '@/utils/clickhouse';
import { useEffect } from 'react';

const Ping = ({name}) => {

    useEffect(() => {
        ping(name)
      }, []);
    return null;
}

export default Ping;
