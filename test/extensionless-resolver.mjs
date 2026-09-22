// The app source uses extensionless relative imports (e.g. `import { logFns }
// from '../logging'`), which webpack/Next.js resolve at build time but Node's
// native ESM resolver does not. This loader hook lets `node --test` import the
// source directly by retrying a failed relative specifier with a `.js`
// extension appended. Registered via `--import ./test/register.mjs`.
export async function resolve(specifier, context, nextResolve) {
  try {
    return await nextResolve(specifier, context);
  } catch (error) {
    if (
      (error?.code === 'ERR_MODULE_NOT_FOUND' ||
        error?.code === 'ERR_UNSUPPORTED_DIR_IMPORT') &&
      (specifier.startsWith('./') || specifier.startsWith('../')) &&
      !/\.[cm]?js$/.test(specifier)
    ) {
      return await nextResolve(`${specifier}.js`, context);
    }
    throw error;
  }
}
