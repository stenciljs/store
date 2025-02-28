import typescript from '@rollup/plugin-typescript';

import pkg from './package.json' with { type: 'json' };

export default {
  input: 'src/index.ts',
  output: [
    {
      format: 'cjs',
      file: pkg.main
    },
    {
      format: 'esm',
      file: pkg.module
    },
  ],
  external: ['@stencil/core'],
  plugins: [typescript({
    outDir: 'dist'
  })],
};
