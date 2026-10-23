import typescript from '@rollup/plugin-typescript';
import { execFile } from 'node:child_process';
import { readFile, rm, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { promisify } from 'node:util';
import { rollup } from 'rollup';
import { describe, expect, it } from 'vitest';

const root = new URL('../', import.meta.url);
// The fixture has its own package.json so `@stencil/store` resolves to the copy installed below
// rather than to this repo's source, which Stencil would compile itself.
const fixture = new URL('./hydrate-app/', import.meta.url);
const installedStore = new URL('node_modules/@stencil/store/', fixture);
const stencilBin = new URL('node_modules/@stencil/core/bin/stencil', root);

/**
 * Bundles the store the same way it is published and installs it into the fixture app,
 * so Stencil consumes it as a pre-built package from node_modules like a real project does.
 */
const installStore = async () => {
  await rm(installedStore, { recursive: true, force: true });
  const bundle = await rollup({
    input: fileURLToPath(new URL('src/index.ts', root)),
    external: ['@stencil/core'],
    plugins: [
      typescript({
        tsconfig: fileURLToPath(new URL('tsconfig.json', root)),
        outDir: fileURLToPath(installedStore),
        declarationDir: fileURLToPath(installedStore),
        declaration: false,
      }),
    ],
  });
  await bundle.write({ format: 'esm', file: fileURLToPath(new URL('index.js', installedStore)) });
  await bundle.close();
  await writeFile(
    new URL('package.json', installedStore),
    JSON.stringify({ name: '@stencil/store', type: 'module', module: 'index.js', exports: './index.js' }),
  );
};

describe('hydrate build', () => {
  it('keeps `Build.isBrowser` branches out of the hydrate app', { timeout: 60_000 }, async () => {
    await installStore();
    await promisify(execFile)(process.execPath, [fileURLToPath(stencilBin), 'build'], {
      cwd: fileURLToPath(fixture),
    });

    const hydrateApp = await readFile(new URL('hydrate/index.js', fixture), 'utf8');

    expect(hydrateApp).toContain('store-cmp');
    expect(
      hydrateApp.includes('BROWSER_ONLY_MODULE_LOADED'),
      'module imported behind `Build.isBrowser` was bundled into the hydrate app',
    ).toBe(false);
  });
});
