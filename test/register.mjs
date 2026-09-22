// Registers the extensionless-import resolver hook so `node --test` can import
// the bundler-style app source. Usage: node --import ./test/register.mjs --test test/
import { register } from 'node:module';
register('./extensionless-resolver.mjs', import.meta.url);
