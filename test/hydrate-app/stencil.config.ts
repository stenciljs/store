import { Config } from '@stencil/core';

export const config: Config = {
  namespace: 'hydrate-app',
  outputTargets: [{ type: 'dist-hydrate-script' }],
};
