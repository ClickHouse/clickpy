// hyperdx-preload.cjs
require('dotenv').config({ path: '.env.local' });
require('@hyperdx/node-opentelemetry/build/src/tracing');
